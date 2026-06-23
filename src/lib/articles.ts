import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  articles,
  articleTags,
  tags,
  articleStatusValues,
  type ArticleStatus,
} from "@/db/schema";
import { slugify } from "@/lib/slug";

export function isArticleStatus(value: string): value is ArticleStatus {
  return (articleStatusValues as readonly string[]).includes(value);
}

/**
 * Slugify, falling back to a short random suffix when the title has no
 * ASCII alphanumerics to slugify (e.g. a Chinese-only title), then disambiguate
 * against existing slugs (excluding `excludeArticleId` when updating).
 */
export async function generateUniqueArticleSlug(
  title: string,
  excludeArticleId?: number,
): Promise<string> {
  const base = slugify(title) || `article-${Math.random().toString(36).slice(2, 8)}`;

  let candidate = base;
  let suffix = 2;
  // Personal-blog scale: a handful of lookups here is not a performance concern.
  while (true) {
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, candidate))
      .limit(1);

    if (existing.length === 0 || existing[0].id === excludeArticleId) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

/** Finds-or-creates a tag for each name and returns their ids, de-duplicated. */
export async function resolveTagsByNames(names: string[]): Promise<number[]> {
  const trimmedNames = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const ids: number[] = [];

  for (const name of trimmedNames) {
    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existing.length > 0) {
      ids.push(existing[0].id);
      continue;
    }

    const slugBase = slugify(name) || `tag-${Math.random().toString(36).slice(2, 8)}`;
    const [created] = await db
      .insert(tags)
      .values({ name, slug: slugBase })
      .onConflictDoNothing({ target: tags.slug })
      .returning({ id: tags.id });

    if (created) {
      ids.push(created.id);
    } else {
      const [bySlug] = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.slug, slugBase))
        .limit(1);
      ids.push(bySlug.id);
    }
  }

  return ids;
}

/** Replaces an article's tag associations wholesale with the given tag ids. */
export async function setArticleTags(articleId: number, tagIds: number[]): Promise<void> {
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  if (tagIds.length === 0) {
    return;
  }
  await db
    .insert(articleTags)
    .values(tagIds.map((tagId) => ({ articleId, tagId })));
}

/** Parses a free-form comma-separated tags input field. */
export function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export type TagRef = { name: string; slug: string };

export async function getAllTagsForArticles(
  articleIds: number[],
): Promise<Map<number, TagRef[]>> {
  if (articleIds.length === 0) return new Map();
  const rows = await db
    .select({
      articleId: articleTags.articleId,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, articleIds));

  const map = new Map<number, TagRef[]>();
  for (const row of rows) {
    const list = map.get(row.articleId) ?? [];
    list.push({ name: row.tagName, slug: row.tagSlug });
    map.set(row.articleId, list);
  }
  return map;
}
