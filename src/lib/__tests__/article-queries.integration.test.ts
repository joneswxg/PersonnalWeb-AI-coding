import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, articleStatusValues, type ArticleStatus } from "@/db/schema";
import { getArticleBySlugForRole, listArticlesForRole } from "@/lib/article-queries";
import { canViewStatus } from "@/lib/visibility";
import type { Role } from "@/lib/roles";

const roles: Role[] = ["visitor", "trusted", "owner"];

let categoryId: number;
const slugByStatus = new Map<ArticleStatus, string>();

beforeAll(async () => {
  const [category] = await db
    .insert(categories)
    .values({ name: "__test-visibility-matrix__", slug: "__test-visibility-matrix__" })
    .returning({ id: categories.id });
  categoryId = category.id;

  for (const status of articleStatusValues) {
    const slug = `__test-${status}-article__`;
    slugByStatus.set(status, slug);
    await db.insert(articles).values({
      title: `Test ${status} article`,
      slug,
      content: "irrelevant content",
      status,
      categoryId,
    });
  }
});

afterAll(async () => {
  for (const slug of slugByStatus.values()) {
    await db.delete(articles).where(eq(articles.slug, slug));
  }
  await db.delete(categories).where(eq(categories.id, categoryId));
});

describe("getArticleBySlugForRole: direct-URL access enforcement matrix", () => {
  for (const role of roles) {
    for (const status of articleStatusValues) {
      const expected = canViewStatus(role, status);
      it(`${role} requesting a ${status} article directly: ${expected ? "allowed" : "denied"}`, async () => {
        const slug = slugByStatus.get(status)!;
        const result = await getArticleBySlugForRole(slug, role);
        if (expected) {
          expect(result).not.toBeNull();
          expect(result?.slug).toBe(slug);
        } else {
          expect(result).toBeNull();
        }
      });
    }
  }
});

describe("listArticlesForRole: draft never appears in listings, regardless of role", () => {
  for (const role of roles) {
    it(`excludes draft articles for role=${role}`, async () => {
      const results = await listArticlesForRole(role, { categorySlug: "__test-visibility-matrix__" });
      expect(results.some((a) => a.status === "draft")).toBe(false);
    });
  }
});
