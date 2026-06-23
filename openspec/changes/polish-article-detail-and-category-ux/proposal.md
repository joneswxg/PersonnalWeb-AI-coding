## Why

Using the admin tools after the last round of changes surfaced three rough edges: the category field on article forms still accepts free text (which can silently create duplicate/typo categories now that `/admin/categories` already manages the canonical list), the article detail page can visually show the title twice when an article's Markdown body happens to start with a heading that repeats the title, and the detail page doesn't offer the same category navigation the home page already has.

## What Changes

- **BREAKING**: Replace the free-text Category input on `/admin/articles/new` and `/admin/articles/[id]/edit` with a dropdown populated from existing categories. Articles must reference an existing category by ID; the "create a category by typing its name" behavior is removed (categories are now created exclusively via `/admin/categories`).
- Detect when an article's Markdown body opens with a level-1 heading that duplicates the article's title (case-insensitive, trimmed) and skip rendering that heading line, so the title isn't shown twice on the detail page.
- Add a left-hand category/tag navigation sidebar to the article detail page, matching the two-column layout already used on the home page, and remove the now-redundant inline category link above the title (the status badge stays).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-management`: "Category Assignment" requirement changes from free-text category entry (with implicit create-by-name) to selecting an existing category from a dropdown; an article can no longer be saved with a category name that doesn't already exist.
- `content-browsing`: adds a requirement governing article detail rendering — when the article body's leading heading duplicates the title, the system suppresses that heading to avoid a duplicate-looking title.

## Impact

- `src/app/admin/articles/new/page.tsx`, `src/app/admin/articles/[id]/edit/page.tsx`: Category field becomes a `<Select>`; form now submits `categoryId` instead of `categoryName`.
- `src/app/admin/articles/actions.ts`, `src/lib/articles.ts`: remove `resolveCategoryByName` (and its implicit-create path); actions accept a `categoryId` directly.
- `src/components/markdown-content.tsx` (or a new `src/lib/markdown.ts` helper): add duplicate-leading-heading detection/suppression, with unit tests.
- `src/app/articles/[slug]/page.tsx`: switch to the home page's two-column grid layout, reuse `CategoryTagNav`, drop the inline category link.
- No database schema changes; `categories` and `articles.categoryId` are unchanged.
