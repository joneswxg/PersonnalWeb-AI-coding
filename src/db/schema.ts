import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  primaryKey,
  customType,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { ActivitySnapshot } from "@/lib/github-activity";

export const articleStatusValues = ["draft", "private", "public"] as const;
export type ArticleStatus = (typeof articleStatusValues)[number];

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull().default(""),
    status: text("status", { enum: articleStatusValues }).notNull().default("draft"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      (): ReturnType<typeof sql> =>
        sql`to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))`,
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("articles_status_idx").on(table.status),
    index("articles_category_idx").on(table.categoryId),
    index("articles_search_vector_idx").using("gin", table.searchVector),
  ],
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.tagId] })],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    bucket: text("bucket").notNull(),
    objectPath: text("object_path").notNull(),
    publicUrl: text("public_url").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    altText: text("alt_text"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("media_assets_article_idx").on(table.articleId),
    index("media_assets_created_at_idx").on(table.createdAt),
  ],
);

export const trustedUsers = pgTable("trusted_users", {
  id: serial("id").primaryKey(),
  githubUsername: text("github_username").notNull().unique(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activitySnapshots = pgTable("activity_snapshots", {
  githubIdentity: text("github_identity").primaryKey(),
  schemaVersion: integer("schema_version").notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull(),
  source: text("source").notNull(),
  window: jsonb("activity_window")
    .$type<ActivitySnapshot["window"]>()
    .notNull(),
  metrics: jsonb("metrics").$type<ActivitySnapshot["metrics"]>().notNull(),
});
