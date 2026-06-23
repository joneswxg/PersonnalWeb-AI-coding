"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, type ArticleStatus } from "@/db/schema";
import { requireOwner } from "@/lib/authz";
import {
  generateUniqueArticleSlug,
  isArticleStatus,
  parseTagsInput,
  resolveTagsByNames,
  setArticleTags,
} from "@/lib/articles";

function readArticleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const rawCategoryId = formData.get("categoryId");
  const tagNames = parseTagsInput(String(formData.get("tags") ?? ""));

  if (!title) {
    throw new Error("Title is required");
  }
  if (typeof rawCategoryId !== "string" || rawCategoryId.trim() === "") {
    throw new Error("Category is required");
  }
  const categoryId = Number(rawCategoryId);
  if (!Number.isInteger(categoryId)) {
    throw new Error("Category is required");
  }

  return { title, content, categoryId, tagNames };
}

export async function createArticle(formData: FormData): Promise<void> {
  await requireOwner();

  const { title, content, categoryId, tagNames } = readArticleForm(formData);
  const slug = await generateUniqueArticleSlug(title);
  const tagIds = await resolveTagsByNames(tagNames);

  const [created] = await db
    .insert(articles)
    .values({ title, slug, content, categoryId, status: "draft" })
    .returning({ id: articles.id });

  await setArticleTags(created.id, tagIds);

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${created.id}/edit`);
}

export async function updateArticle(articleId: number, formData: FormData): Promise<void> {
  await requireOwner();

  const { title, content, categoryId, tagNames } = readArticleForm(formData);
  const tagIds = await resolveTagsByNames(tagNames);

  const [existing] = await db
    .select({ title: articles.title, slug: articles.slug })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);
  if (!existing) {
    throw new Error("Article not found");
  }

  const slug =
    existing.title === title
      ? existing.slug
      : await generateUniqueArticleSlug(title, articleId);

  await db
    .update(articles)
    .set({ title, content, categoryId, slug, updatedAt: new Date() })
    .where(eq(articles.id, articleId));

  await setArticleTags(articleId, tagIds);

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}/edit`);
}

export async function setArticleStatus(
  articleId: number,
  status: ArticleStatus,
): Promise<void> {
  await requireOwner();

  if (!isArticleStatus(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  await db
    .update(articles)
    .set({ status, updatedAt: new Date() })
    .where(eq(articles.id, articleId));

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}/edit`);
}

export async function deleteArticle(articleId: number): Promise<void> {
  await requireOwner();

  // article_tags.articleId is ON DELETE CASCADE, so tag associations are
  // cleaned up automatically by the database.
  await db.delete(articles).where(eq(articles.id, articleId));

  revalidatePath("/admin/articles");
}
