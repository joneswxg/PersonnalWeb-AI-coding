## Context

The personal learning blog (`personal-learning-blog`, archived) is live in production. Real usage of the admin area surfaced concrete gaps: no article or category deletion, no filtering/search in the admin article list, an awkwardly-placed Save button, and unclear navigation. This change addresses those gaps within the existing `article-management` capability and ships a few pure-UI improvements alongside it.

## Goals / Non-Goals

**Goals:**
- Let the owner delete articles and categories safely, without orphaning data or losing the ability to categorize content.
- Let the owner manage categories (create/rename/delete) without going through the "implicitly create via article authoring" path as the only option.
- Let the owner filter/search a growing article list from the admin UI.
- Reduce navigation/scroll friction in the admin UI (Save button position, clearer nav labels, a Home link).

**Non-Goals:**
- Extending the public-facing `content-search` capability. Admin-internal title filtering is a separate, much simpler mechanism (a `WHERE title ILIKE ...` filter) and is not held to the same "no client-side index" requirement, since it's owner-only and not permission-sensitive in the same way.
- Per-article ACLs, category hierarchies, or any change to the `draft`/`private`/`public` state machine — those are unchanged.
- Soft-delete / trash / undo for deleted articles or categories. Deletion is immediate and permanent, mitigated only by a confirmation dialog.

## Decisions

### Category management lives inside `article-management`, not a new capability
Categories only exist to organize articles; their lifecycle (create/rename/delete) has no independent meaning outside of `article-management`'s existing "Category Assignment" requirement. Spinning up a separate `category-management` capability would split closely-related behavior across two spec files for no benefit. The existing capability already owns category *assignment*; this change extends it to also own category *lifecycle*.
**Alternative considered**: a standalone `category-management` capability — rejected as unnecessary fragmentation for a feature this small and this tightly coupled to articles.

### Category deletion: forced migration, not nullable fallback
The database already has `articles.categoryId` as `ON DELETE SET NULL`, which would silently turn affected articles into "Uncategorized" if a category were deleted directly via SQL. This change does **not** rely on that behavior. Instead, the delete action requires the caller to supply a `migrateToCategoryId`, and the implementation does this in one transaction: reassign all articles from the deleted category to the target category, then delete the now-empty category. If there is no other category to migrate to (i.e., it's the only category), the action is rejected before any database write happens — the system must always have at least one category, since every article requires exactly one (per the existing "Category Assignment" requirement).
**Alternative considered**: allow deletion and let articles fall back to "Uncategorized" (simplest, matches the DB default) — rejected because it silently degrades existing content's organization without the owner explicitly choosing where those articles should go.

### Article deletion relies on existing cascade behavior
`article_tags.articleId` is already `ON DELETE CASCADE`, so deleting a row from `articles` automatically removes its tag associations — no new cleanup logic is needed beyond the `DELETE FROM articles WHERE id = ...` call itself, wrapped in the same owner-only authorization check (`requireOwner`) used by every other admin write path.

### Admin list filtering/search is a separate, simpler mechanism from `content-search`
The public-facing search (`content-search` capability) is permission-filtered full-text search served to potentially-untrusted visitors, with a hard requirement that no index ever reaches the client. The admin list filter is the opposite: it's owner-only (already behind the `/admin` route guard), low-volume, and just needs "find the article I'm looking for in my own list" — a simple `ILIKE` title match plus `status`/`categoryId` equality filters in the existing admin query, no full-text index, no role-based result filtering (the owner already sees everything). Reusing or extending `content-search`'s infrastructure for this would conflate two requirements with very different trust boundaries.

### UI changes are implementation tasks, not formal requirements
Renaming nav copy, adding a Home link, and repositioning the Save button are presentation-layer changes with no testable system behavior beyond "the link points to the right place" (already covered implicitly by existing routing) — they don't get `### Requirement` entries in the delta spec. They're tracked directly in `tasks.md`.

## Risks / Trade-offs

- **[Risk]** Forced category migration adds a step (picking a target) to what might feel like a simple delete action → **Mitigation**: this is the explicitly chosen trade-off — losing an article's category silently is worse than one extra required field on a rarely-used admin action.
- **[Risk]** No undo for article/category deletion → **Mitigation**: confirmation dialog is the only safety net; acceptable for a single-owner admin tool at this scale. Revisit if this ever becomes multi-admin.
- **[Risk]** Admin search/filter and public search could be confused as "the same feature" by a future contributor → **Mitigation**: documented explicitly in this design doc and kept as separate code paths (no shared query-building function) so the distinction is visible in the codebase, not just in docs.

## Migration Plan

No database schema migration is required — all new behavior is implemented in the application layer against the existing schema. Deployment is a normal code-only release:
1. Implement and test locally against the existing local Postgres.
2. Deploy via the existing GitHub → Vercel pipeline (auto-deploy on push to `main`).
3. Smoke-test category deletion's migration flow and the "can't delete the only category" guard in production before considering this change complete, since this is the one piece of genuinely new state-mutating logic.

## Open Questions

- Should category rename also let the owner change the slug, or should the slug stay stable once created (affecting existing `/categories/<slug>` URLs)? Defaulting to "slug stays stable on rename, only the display name changes" to avoid breaking existing category page links; revisit if that's not what's wanted.
