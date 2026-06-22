import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, type ArticleStatus } from "@/db/schema";

export type AdminArticleRow = {
  id: number;
  title: string;
  status: ArticleStatus;
  updatedAt: Date;
  categoryName: string | null;
};

/**
 * Owner-only admin list query — separate from the public-facing,
 * permission-filtered full-text search in content-search. The owner already
 * sees everything here, so this is a plain title substring match plus
 * equality filters, not a search index.
 */
export async function listAdminArticles(filter?: {
  status?: ArticleStatus;
  categoryId?: number;
  titleSearch?: string;
}): Promise<AdminArticleRow[]> {
  const conditions = [];
  if (filter?.status) {
    conditions.push(eq(articles.status, filter.status));
  }
  if (filter?.categoryId) {
    conditions.push(eq(articles.categoryId, filter.categoryId));
  }
  const trimmedSearch = filter?.titleSearch?.trim();
  if (trimmedSearch) {
    conditions.push(ilike(articles.title, `%${trimmedSearch}%`));
  }

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(articles.updatedAt));

  return rows;
}
