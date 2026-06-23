## 1. Admin Category Dropdown

- [x] 1.1 Replace the free-text `categoryName` input with a `<Select name="categoryId">` on `/admin/articles/new`, populated from `listCategories()`
- [x] 1.2 Same change on `/admin/articles/[id]/edit`, with the article's current category preselected
- [x] 1.3 Update `createArticle`/`updateArticle` server actions in `src/app/admin/articles/actions.ts` to read `categoryId` directly instead of resolving a category name
- [x] 1.4 Remove `resolveCategoryByName` from `src/lib/articles.ts` (and any now-unused imports/exports)
- [x] 1.5 Update/replace existing tests in `src/app/admin/articles/__tests__/actions.test.ts` that exercised the old `categoryName` flow (no prior createArticle/updateArticle tests existed at all; added full coverage including owner-enforcement and a missing/invalid-categoryId guard — caught and fixed the same `Number(null) === 0` bug class as the earlier deleteCategory fix)

## 2. Duplicate Title Suppression

- [x] 2.1 Add `stripDuplicateLeadingHeading(content, title)` (in `src/lib/markdown.ts` or alongside `MarkdownContent`): if the first line of `content` is an ATX H1 matching `title` (trimmed, case-insensitive), return `content` with that line removed; otherwise return `content` unchanged
- [x] 2.2 Wire it into the article detail page so `MarkdownContent` renders the de-duplicated content
- [x] 2.3 Unit tests: matching leading heading is removed; non-matching leading heading is preserved; a matching heading later in the body (not on the first line) is preserved; content with no leading heading is unchanged

## 3. Article Detail Page Layout

- [x] 3.1 Switch `/articles/[slug]` to the home page's two-column grid (`grid-cols-1 md:grid-cols-[200px_1fr]`)
- [x] 3.2 Render `CategoryTagNav` in the left column, fetching categories/tags the same way the home page does
- [x] 3.3 Remove the inline category link above the title; keep the status badge (for non-`public` articles) in its place

## 4. Verification

- [x] 4.1 Run the full test suite, confirm no regressions (87/87 passing)
- [x] 4.2 Manually verify in the local dev environment: inserted a real article via script whose body repeats its title as a leading `#` heading — confirmed via the rendered HTML that the page has exactly one `<h1>`, the duplicate heading is omitted from the rendered body, and the left `CategoryTagNav` sidebar renders alongside it. The admin category dropdown itself still needs an owner-authenticated click-through (see 4.3)
- [x] 4.3 Deploy via the existing GitHub → Vercel pipeline and smoke-test in production (owner confirmed: category dropdown on new/edit article forms only offers existing categories, and the article detail page shows the same left category/tag sidebar as the home page)
