import { eq } from "drizzle-orm";
import { trustedUsers } from "@/db/schema";

export const roles = ["visitor", "trusted", "owner"] as const;
export type Role = (typeof roles)[number];

/**
 * Pure role-resolution rule, independent of session/DB plumbing so it can be
 * unit tested directly against every input combination.
 */
export function computeRole(input: {
  githubUsername: string | null | undefined;
  ownerGithubUsername: string | null | undefined;
  isOnTrustedAllowList: boolean;
}): Role {
  const { githubUsername, ownerGithubUsername, isOnTrustedAllowList } = input;

  if (!githubUsername) {
    return "visitor";
  }
  if (ownerGithubUsername && githubUsername === ownerGithubUsername) {
    return "owner";
  }
  if (isOnTrustedAllowList) {
    return "trusted";
  }
  return "visitor";
}

async function isOnTrustedAllowList(githubUsername: string): Promise<boolean> {
  // Imported lazily so modules that only need the pure `computeRole` rule
  // (e.g. unit tests) never trigger the DATABASE_URL/connection setup in "@/db".
  const { db } = await import("@/db");
  const rows = await db
    .select({ id: trustedUsers.id })
    .from(trustedUsers)
    .where(eq(trustedUsers.githubUsername, githubUsername))
    .limit(1);
  return rows.length > 0;
}

/** Resolves the current request's role from the active Auth.js session. */
export async function getRole(): Promise<Role> {
  const { auth } = await import("@/auth");
  const session = await auth();
  return resolveRole(session?.githubUsername);
}

/**
 * Resolves a role for a (possibly absent) authenticated GitHub username.
 * Always queries the trusted-users allow-list fresh so that revoking access
 * takes effect immediately, without requiring the affected user to sign out.
 */
export async function resolveRole(
  githubUsername: string | null | undefined,
): Promise<Role> {
  if (!githubUsername) {
    return "visitor";
  }

  const ownerGithubUsername = process.env.OWNER_GITHUB_USERNAME;
  if (ownerGithubUsername && githubUsername === ownerGithubUsername) {
    return "owner";
  }

  const trusted = await isOnTrustedAllowList(githubUsername);
  return computeRole({
    githubUsername,
    ownerGithubUsername,
    isOnTrustedAllowList: trusted,
  });
}
