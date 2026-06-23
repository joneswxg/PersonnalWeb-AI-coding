## Context

`/admin/categories` (from the previous `improve-admin-content-management` change) already provides full category lifecycle management — create, rename, delete-with-migration. With that in place, the article forms' free-text `categoryName` input (backed by `resolveCategoryByName`'s find-or-create logic) is now a liability rather than a convenience: it's the only place left in the app that can silently create a category (via a typo) outside the dedicated management page, and it offers no way to discover what categories already exist while authoring.

Separately, the article detail page (`/articles/[slug]`) renders `<h1>{article.title}</h1>` immediately followed by the Markdown body. Articles imported from external documents (e.g. ones that already open with their own top-level heading matching the doc title) end up showing the title twice. The detail page also doesn't reuse the home page's category/tag sidebar, so categories are far less discoverable there than on the listing page.

## Goals / Non-Goals

**Goals:**
- Make category selection on article forms impossible to typo: always pick from the existing list.
- Eliminate the visual double-title artifact without requiring authors to manually edit pasted content.
- Give the article detail page the same category/tag navigation the home page already has.

**Non-Goals:**
- No changes to the `/admin/categories` page itself (already complete).
- No database schema changes — `categories` and `articles.categoryId` are untouched.
- No general Markdown sanitization/linting; only the single specific case of a leading H1 duplicating the title.

## Decisions

**Drop `resolveCategoryByName`'s implicit create-by-name path.** Once `/admin/categories` exists as the canonical place to create categories, letting article forms also create categories via free text means there are two divergent paths to the same effect, and the free-text one is typo-prone (e.g. "Rust" vs "rust " creating two categories). The form now submits `categoryId` directly from a `<Select>` populated by `listCategories()` (already used by the home page, so no new query is needed). `resolveCategoryByName` and the `categoryName` form field are removed entirely rather than kept as a fallback — there's no scenario where a category should exist that the owner can't also create deliberately via `/admin/categories` first.

**Duplicate-title suppression belongs to `content-browsing`, not `article-management`.** `article-management` governs admin-side authoring (the editor, the state machine, category/tag assignment). This change is about how a saved article is *displayed* to a reader — exactly what `content-browsing`'s existing Purpose statement already covers ("article detail rendering"). The check is a pure function — `stripDuplicateLeadingHeading(content, title)` — that compares the first line of `content`, if it's an ATX H1 (`# ...`), against the trimmed/lowercased title, and drops that line if they match. It runs at render time only; the stored `article.content` is never mutated, so the detection logic can change later without a migration.

**Reuse `CategoryTagNav` as-is on the article detail page.** Rather than building an article-scoped sidebar (e.g. "this article's category + related tags"), the detail page adopts the exact same global category/tag navigation and two-column grid (`grid-cols-[200px_1fr]`) the home page uses. This keeps category/tag navigation consistent and discoverable across both pages, and means the inline category link above the title becomes redundant and is removed (the status badge for non-public articles stays, since the sidebar doesn't carry per-article status).

## Risks / Trade-offs

- [Risk] An article whose category was deleted via `/admin/categories` without picking this article up in the migration (shouldn't happen given the forced-migration guarantee, but if `categoryId` is ever null) → the dropdown must handle "no category selected" by requiring a value (categories always exist, per the existing minimum-one-category guarantee), so this is structurally prevented rather than handled defensively.
- [Risk] Heading-suppression could hide a heading that *coincidentally* matches the title but was meant to be read (e.g. an article titled "Introduction" whose body intentionally repeats "# Introduction" as a section header for a reason) → scoped narrowly to only the very first line of the body, so a same-named heading appearing later in the article is untouched.
- [Trade-off] Existing articles authored before this change keep whatever `categoryName` they were saved with (already stored as `categoryId`, no migration needed) — this change only affects the authoring UI going forward.

## Open Questions

None — all three decisions are settled for this change.
