import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleTags, tags } from "@/db/schema";

const SLUG = "__test-delete-cascade-article__";
const TAG_SLUG = "__test-delete-cascade-tag__";

async function cleanup() {
  await db.delete(articles).where(eq(articles.slug, SLUG));
  await db.delete(tags).where(eq(tags.slug, TAG_SLUG));
}

afterEach(cleanup);

describe("deleting an article cascades to article_tags", () => {
  it("removes tag associations when the article is deleted", async () => {
    await cleanup();

    const [tag] = await db
      .insert(tags)
      .values({ name: "__test-delete-cascade-tag__", slug: TAG_SLUG })
      .returning();
    const [article] = await db
      .insert(articles)
      .values({ title: "Cascade test article", slug: SLUG, content: "x" })
      .returning();
    await db.insert(articleTags).values({ articleId: article.id, tagId: tag.id });

    const before = await db
      .select()
      .from(articleTags)
      .where(eq(articleTags.articleId, article.id));
    expect(before).toHaveLength(1);

    await db.delete(articles).where(eq(articles.id, article.id));

    const after = await db
      .select()
      .from(articleTags)
      .where(eq(articleTags.articleId, article.id));
    expect(after).toHaveLength(0);
  });
});
