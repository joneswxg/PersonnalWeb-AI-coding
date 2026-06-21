import type { ArticleStatus } from "@/db/schema";
import type { Role } from "@/lib/roles";

/**
 * Single source of truth for "can this role see an article in this status"
 * on public-facing read paths (listings, detail pages, search). `draft` is
 * never visible here for any role, including the owner - drafts are only
 * reachable through the admin editor, which queries the database directly
 * rather than going through this predicate.
 */
export function canViewStatus(role: Role, status: ArticleStatus): boolean {
  if (status === "draft") {
    return false;
  }
  if (role === "owner" || role === "trusted") {
    return true;
  }
  return status === "public";
}

/** Statuses visible to a given role, for building SQL `WHERE status IN (...)` filters. */
export function visibleStatusesFor(role: Role): ArticleStatus[] {
  if (role === "owner" || role === "trusted") {
    return ["private", "public"];
  }
  return ["public"];
}
