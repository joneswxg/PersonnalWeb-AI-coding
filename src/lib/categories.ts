import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { slugify } from "@/lib/slug";

export class CategoryError extends Error {}

export type CategoryWithCount = {
  id: number;
  name: string;
  slug: string;
  articleCount: number;
};

export async function listCategoriesWithArticleCount(): Promise<CategoryWithCount[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      articleCount: sql<number>`count(${articles.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.name);
}

export async function createCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new CategoryError("Category name is required");
  }

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, trimmed))
    .limit(1);
  if (existing.length > 0) {
    throw new CategoryError(`A category named "${trimmed}" already exists`);
  }

  const slugBase = slugify(trimmed) || `category-${Math.random().toString(36).slice(2, 8)}`;
  await db.insert(categories).values({ name: trimmed, slug: slugBase });
}

/** Renames a category's display name. The slug is left unchanged so existing /categories/<slug> links keep working. */
export async function renameCategory(categoryId: number, newName: string): Promise<void> {
  const trimmed = newName.trim();
  if (!trimmed) {
    throw new CategoryError("Category name is required");
  }
  await db.update(categories).set({ name: trimmed }).where(eq(categories.id, categoryId));
}

/**
 * Deletes a category after reassigning all of its articles to migrateToCategoryId.
 * Rejects if migrateToCategoryId doesn't exist, equals categoryId, or if categoryId
 * is the only category in the system (at least one category must always exist).
 */
export async function deleteCategoryWithMigration(
  categoryId: number,
  migrateToCategoryId: number,
): Promise<void> {
  if (categoryId === migrateToCategoryId) {
    throw new CategoryError("Migration target must be a different category");
  }

  const allCategories = await db.select({ id: categories.id }).from(categories);
  if (allCategories.length <= 1) {
    throw new CategoryError("Cannot delete the only category");
  }
  if (!allCategories.some((c) => c.id === migrateToCategoryId)) {
    throw new CategoryError("Migration target category does not exist");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(articles)
      .set({ categoryId: migrateToCategoryId })
      .where(eq(articles.categoryId, categoryId));
    await tx.delete(categories).where(eq(categories.id, categoryId));
  });
}
