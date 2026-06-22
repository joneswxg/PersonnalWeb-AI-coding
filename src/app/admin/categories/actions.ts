"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/authz";
import {
  createCategory as createCategoryInDb,
  renameCategory as renameCategoryInDb,
  deleteCategoryWithMigration,
} from "@/lib/categories";

export async function createCategory(formData: FormData): Promise<void> {
  await requireOwner();
  const name = String(formData.get("name") ?? "");
  await createCategoryInDb(name);
  revalidatePath("/admin/categories");
}

export async function renameCategory(categoryId: number, formData: FormData): Promise<void> {
  await requireOwner();
  const name = String(formData.get("name") ?? "");
  await renameCategoryInDb(categoryId, name);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(categoryId: number, formData: FormData): Promise<void> {
  await requireOwner();
  const rawValue = formData.get("migrateToCategoryId");
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new Error("A migration target category must be selected");
  }
  const migrateToCategoryId = Number(rawValue);
  if (!Number.isInteger(migrateToCategoryId)) {
    throw new Error("A migration target category must be selected");
  }
  await deleteCategoryWithMigration(categoryId, migrateToCategoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
}
