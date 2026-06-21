import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleStatusValues, type ArticleStatus } from "@/db/schema";
import { searchArticlesForRole } from "@/lib/article-queries";
import { canViewStatus } from "@/lib/visibility";
import type { Role } from "@/lib/roles";

const roles: Role[] = ["visitor", "trusted", "owner"];
const UNIQUE_TOKEN = "zzqxsearchtoken";

const slugByStatus = new Map<ArticleStatus, string>();

beforeAll(async () => {
  for (const status of articleStatusValues) {
    const slug = `__search-test-${status}__`;
    slugByStatus.set(status, slug);
    await db.insert(articles).values({
      title: `Searchable ${status} article`,
      slug,
      content: `This article mentions ${UNIQUE_TOKEN} for search testing.`,
      status,
    });
  }
});

afterAll(async () => {
  for (const slug of slugByStatus.values()) {
    await db.delete(articles).where(eq(articles.slug, slug));
  }
});

describe("searchArticlesForRole: role-filtered, draft-excluded full-text search", () => {
  for (const role of roles) {
    it(`role=${role} only sees statuses it's allowed to view, never draft`, async () => {
      const results = await searchArticlesForRole(UNIQUE_TOKEN, role);
      const foundSlugs = new Set(results.map((r) => r.slug));

      for (const status of articleStatusValues) {
        const slug = slugByStatus.get(status)!;
        expect(foundSlugs.has(slug)).toBe(canViewStatus(role, status));
      }

      expect(results.some((r) => r.status === "draft")).toBe(false);
    });
  }

  it("returns no results for a query that matches nothing", async () => {
    const results = await searchArticlesForRole("noxxsuchtokenexists", "owner");
    expect(results).toEqual([]);
  });

  it("returns no results for an empty/whitespace query without hitting the database", async () => {
    expect(await searchArticlesForRole("   ", "owner")).toEqual([]);
  });
});
