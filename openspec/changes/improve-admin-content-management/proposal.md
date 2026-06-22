## Why

Now that the personal learning blog is live, real usage of the admin area surfaced concrete friction: there is no way to delete an article or a category, no way to filter or search the admin article list, the "Save" button on the article editor is buried below a long Markdown editor, and the admin navigation is unclear ("Articles" doesn't read as an admin area, and there's no explicit way back to the home page besides the logo).

## What Changes

- Rename all "Articles" admin navigation/page copy to "Article Management" (nav link, list page heading, edit page heading) for clarity that this is the admin area.
- Add a "Home" link to the site navigation, placed before "Search", in addition to the existing clickable logo.
- Add category management: a new `/admin/categories` page (owner-only) supporting create, rename, and delete. Deleting a category requires choosing a migration target category that its articles are reassigned to; deletion is blocked if it is the only category, since the system must always retain at least one category. The category list shows the article count per category.
- Add article deletion to `/admin/articles`, gated behind a confirmation dialog.
- Add status and category filters, plus a title search, to the `/admin/articles` list (admin-internal filtering, distinct from the public-facing full-text search covered by the `content-search` capability).
- Move the "Save" button on the article edit page above the Title/Category/Tags/Markdown editor form fields (directly below the draft/private/public status buttons), so it's reachable without scrolling past the editor.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-management`: adds category management (create/rename/delete-with-forced-migration, with a minimum-one-category invariant) and article deletion; adds admin-list filtering and search as supporting behavior for managing a growing article set. The Markdown authoring, publication state machine, category assignment, and tag assignment requirements already in this capability are unchanged.

## Impact

- New UI: `/admin/categories` page; new controls on `/admin/articles` (filters, search, delete) and `/admin/articles/[id]/edit` (relocated Save button) and the site header (Home link, renamed Article Management link).
- New server actions: category create/rename/delete (with migration), article delete.
- Database: no schema changes required. The existing `articles.categoryId` foreign key (`ON DELETE SET NULL`) remains as a safety net at the database layer, but category deletion will go through an application-level "reassign articles, then delete" flow rather than relying on that default.
- No changes to `access-control`, `content-browsing`, or `content-search` — admin-internal search/filtering is explicitly out of scope for the `content-search` capability's permission-filtered full-text search.
