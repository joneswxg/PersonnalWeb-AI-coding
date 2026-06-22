## 1. Navigation and Layout Polish (pure UI, no backend)

- [x] 1.1 Rename the "Articles" link in the site header nav to "Article Management"
- [x] 1.2 Rename the `/admin/articles` list page heading from "Articles" to "Article Management"
- [x] 1.3 Add a "Home" link to the site header nav, pointing to `/`, placed before "Search"
- [x] 1.4 Move the "Save changes" button on the article edit page to directly below the draft/private/public status buttons, above the Title/Category/Tags/Markdown editor fields, keeping it wired to the same form submission

## 2. Category Lifecycle Management

- [x] 2.1 Implement `createCategory` server action (owner-only, via `requireOwner`)
- [x] 2.2 Implement `renameCategory` server action (owner-only; updates name, keeps slug stable)
- [x] 2.3 Implement `deleteCategory` server action: require a `migrateToCategoryId`, reassign all articles from the deleted category to the target in a transaction, then delete the category; reject if no other category exists
- [x] 2.4 Add a query to count articles per category, for display in the management UI
- [x] 2.5 Build the `/admin/categories` page: list (with article counts), create form, rename control, delete control (with migration-target picker)
- [x] 2.6 Add tests: create, rename, delete-with-migration (articles reassigned correctly), delete-blocked-when-only-category, non-owner rejected for all three actions

## 3. Article Deletion

- [x] 3.1 Implement `deleteArticle` server action (owner-only, via `requireOwner`); rely on existing `article_tags` cascade for cleanup
- [x] 3.2 Add a delete control with a confirmation dialog to the `/admin/articles` list and/or edit page
- [x] 3.3 Add tests: owner can delete an article (and its tag associations are gone), non-owner is rejected

## 4. Admin Article List Filtering and Search

- [x] 4.1 Extend the admin article query to support an optional status filter
- [x] 4.2 Extend the admin article query to support an optional category filter
- [x] 4.3 Extend the admin article query to support an optional title search (`ILIKE`)
- [x] 4.4 Add filter/search controls to the `/admin/articles` list UI
- [x] 4.5 Add tests: status filter, category filter, title search, and combinations thereof return the expected subset

## 5. Verification

- [x] 5.1 Verify category deletion's migration flow and the "can't delete the only category" guard against the local dev database (covered by real-DB integration tests in `categories.test.ts`/`categories.guard.test.ts`; owner-authenticated UI click-through still pending, see 5.3)
- [x] 5.2 Run the full test suite and confirm no regressions in existing access-control/content-browsing/content-search tests (73/73 passing; also confirmed via curl that unauthenticated requests to the new `/admin/categories` route and `/admin/articles` with filter query params still redirect correctly, and public pages are unaffected)
- [x] 5.3 Deploy via the existing GitHub → Vercel pipeline and smoke-test category deletion, article deletion, and the admin filters in production (owner confirmed: nav links, category create/rename/delete-with-migration, article delete, status/category/title filters, and the relocated Save button all work as expected)
