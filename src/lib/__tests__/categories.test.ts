import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import {
  CategoryError,
  createCategory,
  deleteCategoryWithMigration,
  listCategoriesWithArticleCount,
  renameCategory,
} from "@/lib/categories";

const PREFIX = "__test-cat__";

async function cleanup() {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, `${PREFIX}A`));
  for (const row of rows) {
    await db.delete(articles).where(eq(articles.categoryId, row.id));
  }
  await db.delete(categories).where(eq(categories.slug, "test-cat-a"));
  await db.delete(categories).where(eq(categories.slug, "test-cat-b"));
  await db.delete(categories).where(eq(categories.slug, "test-cat-a-renamed"));
}

beforeEach(cleanup);
afterEach(cleanup);

describe("createCategory", () => {
  it("creates a category with a derived slug", async () => {
    await createCategory(`${PREFIX}A`);
    const [created] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, `${PREFIX}A`));
    expect(created).toBeDefined();
    expect(created.slug).toBe("test-cat-a");
  });

  it("rejects a duplicate name", async () => {
    await createCategory(`${PREFIX}A`);
    await expect(createCategory(`${PREFIX}A`)).rejects.toBeInstanceOf(CategoryError);
  });

  it("rejects an empty name", async () => {
    await expect(createCategory("   ")).rejects.toBeInstanceOf(CategoryError);
  });
});

describe("renameCategory", () => {
  it("updates the name but keeps the slug stable", async () => {
    await createCategory(`${PREFIX}A`);
    const [before] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, `${PREFIX}A`));

    await renameCategory(before.id, `${PREFIX}A-renamed`);

    const [after] = await db.select().from(categories).where(eq(categories.id, before.id));
    expect(after.name).toBe(`${PREFIX}A-renamed`);
    expect(after.slug).toBe(before.slug);
  });
});

describe("deleteCategoryWithMigration", () => {
  it("reassigns articles to the migration target, then deletes the category", async () => {
    await createCategory(`${PREFIX}A`);
    await createCategory(`${PREFIX}B`);
    const [catA] = await db.select().from(categories).where(eq(categories.name, `${PREFIX}A`));
    const [catB] = await db.select().from(categories).where(eq(categories.name, `${PREFIX}B`));

    const [article] = await db
      .insert(articles)
      .values({
        title: "Article in category A",
        slug: `__test-cat-article-${Date.now()}__`,
        content: "x",
        categoryId: catA.id,
      })
      .returning();

    await deleteCategoryWithMigration(catA.id, catB.id);

    const [deleted] = await db.select().from(categories).where(eq(categories.id, catA.id));
    expect(deleted).toBeUndefined();

    const [updatedArticle] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, article.id));
    expect(updatedArticle.categoryId).toBe(catB.id);

    await db.delete(articles).where(eq(articles.id, article.id));
  });

  it("rejects when the migration target equals the category being deleted", async () => {
    await createCategory(`${PREFIX}A`);
    await createCategory(`${PREFIX}B`);
    const [catA] = await db.select().from(categories).where(eq(categories.name, `${PREFIX}A`));

    await expect(deleteCategoryWithMigration(catA.id, catA.id)).rejects.toBeInstanceOf(
      CategoryError,
    );
  });

  it("rejects when the migration target category does not exist", async () => {
    await createCategory(`${PREFIX}A`);
    await createCategory(`${PREFIX}B`);
    const [catA] = await db.select().from(categories).where(eq(categories.name, `${PREFIX}A`));

    await expect(
      deleteCategoryWithMigration(catA.id, catA.id + 999999),
    ).rejects.toBeInstanceOf(CategoryError);
  });
});

describe("listCategoriesWithArticleCount", () => {
  it("reports the correct article count per category", async () => {
    await createCategory(`${PREFIX}A`);
    const [catA] = await db.select().from(categories).where(eq(categories.name, `${PREFIX}A`));

    const [article] = await db
      .insert(articles)
      .values({
        title: "Counted article",
        slug: `__test-cat-count-${Date.now()}__`,
        content: "x",
        categoryId: catA.id,
      })
      .returning();

    const list = await listCategoriesWithArticleCount();
    const entry = list.find((c) => c.id === catA.id);
    expect(entry?.articleCount).toBe(1);

    await db.delete(articles).where(eq(articles.id, article.id));
  });
});
