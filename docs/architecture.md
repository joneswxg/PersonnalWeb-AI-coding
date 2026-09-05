# Architecture

## Purpose

`personal-learning-blog` is a personal learning blog with public content, trusted-reader content, and owner-only administration. The application is implemented as a Next.js App Router project with server-side data access through Drizzle ORM and PostgreSQL.

## Stack

- Next.js 16 App Router for routing, server components, and server actions.
- React 19 and TypeScript for UI and application code.
- Drizzle ORM with the `postgres` driver for database access.
- NextAuth/Auth.js with GitHub OAuth for authentication.
- PostgreSQL full-text search through a generated `tsvector` column.
- Vitest for unit and integration tests.
- ESLint and TypeScript for static checks.

## Top-Level Layout

- `src/app/` contains route segments, layouts, page components, API route handlers, and server actions.
- `src/components/` contains reusable UI components for article cards, navigation, markdown, auth controls, and editor surfaces.
- `src/components/ui/` contains lower-level shared UI primitives.
- `src/lib/` contains domain logic for articles, categories, roles, authorization, markdown, search, slugs, and visibility.
- `src/db/` contains Drizzle schema and database client setup.
- `drizzle/` contains migration SQL and Drizzle metadata.
- `openspec/` contains spec-driven planning artifacts and capability specs.
- `docs/` contains architecture, testing, and review documentation.
- `scripts/` contains stable command wrappers for development and verification.
- `.codex/` contains Codex configuration, rules, hooks, and project skills.
- `.github/` contains Codex prompt assets and GitHub Actions workflows.

## Routing And UI

The public application is route-driven under `src/app/`:

- `/` renders the recruiter-first Portfolio Home with Git-managed profile data,
  exactly three Featured Projects, an Activity Snapshot summary, and a
  role-filtered Technical Journal preview.
- `/projects` renders the Public Project Directory and Activity Dashboard from
  GitHub repository data, with a retained snapshot or explicit unavailable
  state when GitHub cannot be refreshed.
- `/journal` lists articles visible to the current role and shows category/tag
  navigation.
- `/articles/[slug]` renders an article detail page after role-based visibility checks.
- `/categories/[slug]` filters article listings by category.
- `/tags/[slug]` filters article listings by tag.
- `/search` runs server-side full-text search with the same role-based visibility filters as listings.
- `/admin/*` contains owner-only article, category, and trusted-user management screens.
- `/api/auth/[...nextauth]` delegates auth requests to NextAuth handlers.

Most data-dependent pages are server-rendered and call functions in `src/lib/` directly. Admin mutations are implemented as server actions in route-local `actions.ts` files.

## Data Model

The Drizzle schema in `src/db/schema.ts` defines:

- `articles`: title, slug, markdown content, status, category reference, generated search vector, and timestamps.
- `categories`: category name, slug, and creation timestamp.
- `tags`: tag name, slug, and creation timestamp.
- `article_tags`: many-to-many join table between articles and tags.
- `trusted_users`: GitHub usernames that can access trusted/private content.

Article statuses are `draft`, `private`, and `public`:

- `draft` articles are only available through admin flows.
- `private` articles are visible to trusted users and the owner on public-facing read paths.
- `public` articles are visible to all visitors.

The database client in `src/db/index.ts` requires `DATABASE_URL`. In development it reuses a global Postgres client to avoid exhausting local connections during Next.js hot reloads.

## Authentication And Authorization

Authentication is configured in `src/auth.ts` with the GitHub provider. The GitHub login name is copied into the session as `session.githubUsername`.

Role resolution lives in `src/lib/roles.ts`:

- `visitor`: unauthenticated users or authenticated users without access.
- `trusted`: authenticated GitHub users present in `trusted_users`.
- `owner`: authenticated GitHub user matching `OWNER_GITHUB_USERNAME`.

Authorization helpers live in `src/lib/authz.ts`. Owner-only mutations call `requireOwner()`, which throws `ForbiddenError` unless the current role is `owner`.

Visibility rules live in `src/lib/visibility.ts` and are used by listing, detail, and search queries. This keeps article status access consistent across read paths.

## Content Queries

`src/lib/article-queries.ts` owns public-facing article reads:

- `listArticlesForRole()` filters by visible statuses and optional category/tag filters.
- `getArticleBySlugForRole()` loads one article and rejects invisible statuses.
- `searchArticlesForRole()` combines full-text search with role visibility in the same SQL `WHERE` clause.
- `listCategories()` and `listTags()` support navigation.

`src/lib/admin-articles.ts` owns owner-facing article list queries. Admin queries are separate from public search because owners need direct management views across all statuses.

## Content Management

`src/lib/articles.ts` contains article-adjacent helpers:

- Article status validation.
- Unique article slug generation.
- Tag parsing and find-or-create behavior.
- Article/tag association replacement.
- Bulk tag lookup for article cards.

`src/lib/categories.ts` contains category management, including category creation, renaming, and delete-with-migration behavior so articles are reassigned before a category is removed.

Markdown rendering and sanitization concerns are isolated in `src/lib/markdown.ts` and UI rendering components such as `src/components/markdown-content.tsx`.

## Testing And Verification

The default definition of done is:

```sh
./scripts/check.sh
```

That runs lint, TypeScript typecheck, Vitest, and production build. Focused test runs can use `./scripts/test.sh`; lint-only checks can use `./scripts/lint.sh`.

The test suite currently concentrates on `src/lib/`, including roles, visibility, markdown, categories, article queries, admin article behavior, delete cascade behavior, and search.

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. `npm run build`

The workflow targets pushes and pull requests to `main`.

## Environment Variables

Known runtime variables include:

- `DATABASE_URL` for PostgreSQL.
- `OWNER_GITHUB_USERNAME` for owner role resolution.
- GitHub OAuth and NextAuth/Auth.js secrets required by the authentication provider.

Keep concrete values in local or deployment environments only. Do not commit secrets.

## Migration Notes

Claude Code and OMC history files have been removed as part of the Codex migration. OpenSpec remains in place and is also mirrored through `.codex/skills/openspec-*` for future spec-driven work.
