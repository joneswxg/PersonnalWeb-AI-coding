"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trustedUsers } from "@/db/schema";
import { requireOwner } from "@/lib/authz";

export async function addTrustedUser(formData: FormData): Promise<void> {
  await requireOwner();

  const githubUsername = String(formData.get("githubUsername") ?? "").trim();
  if (!githubUsername) {
    throw new Error("GitHub username is required");
  }

  await db
    .insert(trustedUsers)
    .values({ githubUsername })
    .onConflictDoNothing();

  revalidatePath("/admin/trusted-users");
}

export async function removeTrustedUser(githubUsername: string): Promise<void> {
  await requireOwner();

  await db
    .delete(trustedUsers)
    .where(eq(trustedUsers.githubUsername, githubUsername));

  revalidatePath("/admin/trusted-users");
}
