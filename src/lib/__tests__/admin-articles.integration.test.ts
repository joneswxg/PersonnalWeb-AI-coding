import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { listAdminArticles } from "@/lib/admin-articles";

const PREFIX = "__test-admin-list__";

async function cleanup() {
  await db.delete(articles).where(eq(articles.slug, `${PREFIX}-draft`));
  await db.delete(articles).where(eq(articles.slug, `${PREFIX}-public`));
  await db.delete(categories).where(eq(categories.slug, "test-admin-list-cat"));
}

beforeEach(cleanup);
afterEach(cleanup);

describe("listAdminArticles", () => {
  it("filters by status", async () => {
    await db.insert(articles).values([
      { title: `${PREFIX} draft`, slug: `${PREFIX}-draft`, content: "x", status: "draft" },
      { title: `${PREFIX} public`, slug: `${PREFIX}-public`, content: "x", status: "public" },
    ]);

    const draftsOnly = await listAdminArticles({ status: "draft" });
    expect(draftsOnly.some((a) => a.title === `${PREFIX} draft`)).toBe(true);
    expect(draftsOnly.some((a) => a.title === `${PREFIX} public`)).toBe(false);
  });

  it("filters by category", async () => {
    const [category] = await db
      .insert(categories)
      .values({ name: "__test-admin-list-cat__", slug: "test-admin-list-cat" })
      .returning();
    await db.insert(articles).values([
      {
        title: `${PREFIX} draft`,
        slug: `${PREFIX}-draft`,
        content: "x",
        categoryId: category.id,
      },
      { title: `${PREFIX} public`, slug: `${PREFIX}-public`, content: "x" },
    ]);

    const inCategory = await listAdminArticles({ categoryId: category.id });
    expect(inCategory.map((a) => a.title)).toContain(`${PREFIX} draft`);
    expect(inCategory.map((a) => a.title)).not.toContain(`${PREFIX} public`);
  });

  it("filters by title search, case-insensitively", async () => {
    await db.insert(articles).values({
      title: `${PREFIX} Searchable Title`,
      slug: `${PREFIX}-draft`,
      content: "x",
    });

    const found = await listAdminArticles({ titleSearch: "searchable" });
    expect(found.map((a) => a.title)).toContain(`${PREFIX} Searchable Title`);

    const notFound = await listAdminArticles({ titleSearch: "zzz-no-match-zzz" });
    expect(notFound.map((a) => a.title)).not.toContain(`${PREFIX} Searchable Title`);
  });

  it("combines filters", async () => {
    const [category] = await db
      .insert(categories)
      .values({ name: "__test-admin-list-cat__", slug: "test-admin-list-cat" })
      .returning();
    await db.insert(articles).values([
      {
        title: `${PREFIX} match`,
        slug: `${PREFIX}-draft`,
        content: "x",
        status: "draft",
        categoryId: category.id,
      },
      {
        title: `${PREFIX} match`,
        slug: `${PREFIX}-public`,
        content: "x",
        status: "public",
        categoryId: category.id,
      },
    ]);

    const result = await listAdminArticles({
      status: "draft",
      categoryId: category.id,
      titleSearch: "match",
    });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("draft");
  });

  it("returns everything when no filter is given", async () => {
    await db.insert(articles).values({
      title: `${PREFIX} draft`,
      slug: `${PREFIX}-draft`,
      content: "x",
    });
    const all = await listAdminArticles();
    expect(all.map((a) => a.title)).toContain(`${PREFIX} draft`);
  });
});
