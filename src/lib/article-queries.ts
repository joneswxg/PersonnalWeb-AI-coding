import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleTags, categories, tags } from "@/db/schema";
import type { Role } from "@/lib/roles";
import { visibleStatusesFor } from "@/lib/visibility";
import { getAllTagsForArticles, type TagRef } from "@/lib/articles";

export type ArticleCardData = {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "private" | "public";
  excerpt: string;
  updatedAt: Date;
  categoryName: string | null;
  categorySlug: string | null;
  tags: TagRef[];
};

/** Crude markdown-to-plain-text excerpt; good enough for a card preview. */
export function excerpt(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
}

async function attachTags(rows: Omit<ArticleCardData, "tags">[]): Promise<ArticleCardData[]> {
  const tagsByArticle = await getAllTagsForArticles(rows.map((r) => r.id));
  return rows.map((row) => ({ ...row, tags: tagsByArticle.get(row.id) ?? [] }));
}

export async function listArticlesForRole(
  role: Role,
  filter?: { categorySlug?: string; tagSlug?: string },
): Promise<ArticleCardData[]> {
  const visibleStatuses = visibleStatusesFor(role);

  let articleIdsForTag: number[] | null = null;
  if (filter?.tagSlug) {
    const tagRows = await db
      .select({ articleId: articleTags.articleId })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(tags.slug, filter.tagSlug));
    articleIdsForTag = tagRows.map((r) => r.articleId);
    if (articleIdsForTag.length === 0) {
      return [];
    }
  }

  const conditions = [inArray(articles.status, visibleStatuses)];
  if (filter?.categorySlug) {
    conditions.push(eq(categories.slug, filter.categorySlug));
  }
  if (articleIdsForTag) {
    conditions.push(inArray(articles.id, articleIdsForTag));
  }

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      status: articles.status,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(articles.updatedAt));

  return attachTags(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      excerpt: excerpt(row.content),
      updatedAt: row.updatedAt,
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
    })),
  );
}

export async function getArticleBySlugForRole(slug: string, role: Role) {
  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      status: articles.status,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!article) {
    return null;
  }

  const visibleStatuses = visibleStatusesFor(role);
  if (!visibleStatuses.includes(article.status)) {
    return null;
  }

  const tagsByArticle = await getAllTagsForArticles([article.id]);
  return { ...article, tags: tagsByArticle.get(article.id) ?? [] };
}

/**
 * Server-side full-text search. The role filter (visibleStatusesFor) and the
 * text match both live in the same WHERE clause, so a single query produces
 * already-permission-filtered results - there is no separate "search index"
 * artifact that could be shipped to the client.
 */
export async function searchArticlesForRole(
  query: string,
  role: Role,
): Promise<ArticleCardData[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const visibleStatuses = visibleStatusesFor(role);

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      status: articles.status,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(
        inArray(articles.status, visibleStatuses),
        sql`${articles.searchVector} @@ plainto_tsquery('english', ${trimmed})`,
      ),
    )
    .orderBy(desc(articles.updatedAt));

  return attachTags(
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      excerpt: excerpt(row.content),
      updatedAt: row.updatedAt,
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
    })),
  );
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function listTags() {
  return db.select().from(tags).orderBy(tags.name);
}
