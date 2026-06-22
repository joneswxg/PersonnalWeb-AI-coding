## Context

This is a greenfield project (no existing application code). The product shape was settled through an exploration session: a personal learning-notes site where most articles are `private`, a few are `public`, content is organized by category + tags, and the author (plus optionally a small allow-listed group) logs in via GitHub OAuth to read private content and manage articles through an in-browser Markdown editor. Search must be server-side and permission-filtered — a static, client-shipped search index is explicitly disallowed because it would leak `private` content text regardless of UI gating.

The author wants zero self-managed infrastructure: no servers to provision, no databases to install, deploys triggered by `git push` to GitHub, and to stay within free tiers at personal-blog traffic levels.

## Goals / Non-Goals

**Goals:**
- A single deployable application (frontend + backend) that supports per-article visibility (`draft`/`private`/`public`) enforced on every read path, including search.
- GitHub OAuth login with a role model (`visitor`/`trusted`/`owner`) backed by a maintainable allow-list, not a custom username/password system.
- Zero self-managed servers or databases — managed/serverless hosting and database services only.
- A card-based public reading UI with category and tag navigation.
- An in-app Markdown editor as the single source of truth for article content (no local-file/DB sync step).

**Non-Goals:**
- Daily quick-log / streak-tracking features (e.g. contribution heatmaps) — explicitly out of scope per the proposal.
- Per-article access lists (e.g. "this article only for user X") — role-based visibility only.
- Bidirectional wiki-style linking between articles — hierarchical categories + free tags only.
- Comments, social features, or multi-tenant support beyond the owner + a small trusted allow-list.

## Decisions

### Framework: Next.js (App Router), deployed on Vercel
A single Next.js app serves both the public reader-facing pages and the authenticated admin/editor UI, using Server Components for permission-filtered rendering and Route Handlers/Server Actions for the API surface (auth callbacks, article CRUD, search). Vercel is the deploy target because it has first-party Next.js support, deploys automatically on every push to the linked GitHub repository, and its Hobby tier is free for personal/non-commercial projects at this traffic scale — satisfying the "no self-managed server" requirement.
**Alternatives considered**: A separate static frontend (Astro/Hugo) + standalone API service was rejected — splitting the codebase adds operational surface (two deploys, two domains/CORS) for no benefit, since the per-request permission checks needed for `private` content and search rule out a purely static frontend anyway. Netlify/Cloudflare Pages would also work but have less seamless Next.js-specific defaults.

### Database: Postgres on Neon (serverless, managed)
Neon's serverless Postgres requires no installation — provisioning is "create a project, copy a connection string." Its free tier comfortably covers a personal blog's data volume (article text is small at any realistic article count), and it scales to zero when idle, which fits low, bursty personal traffic. Drizzle ORM is used for schema/queries: it's lightweight, fully typed, and has good cold-start performance in serverless functions compared to heavier ORMs.
**Alternatives considered**: Supabase was considered — it bundles auth/storage which aren't needed here since GitHub OAuth handles auth directly; Neon is a narrower, simpler fit. Turso (serverless SQLite) was considered for the "git-like, ultra-light" feel, but Postgres's native full-text search (see below) is a strong reason to prefer Postgres over SQLite here.

### Search: Postgres native full-text search (`tsvector`/`tsquery`), queried server-side
Search runs as a SQL query against the `articles` table (a generated `tsvector` column + a GIN index), filtered by the requester's role (`visitor` → `status = 'public'`; `trusted`/`owner` → `status IN ('public','private')`) in the same query, before any results are returned. No search index is ever sent to the client.
**Alternatives considered**: A static index (e.g. Pagefind) was explicitly rejected per the proposal — it would ship private content to every visitor's browser. A dedicated search service (Algolia/Elasticsearch) was rejected as unnecessary operational weight for personal-scale data that Postgres FTS handles fine.

### Auth & roles: Auth.js (NextAuth) with the GitHub provider; role resolved from a server-side allow-list
Login is GitHub OAuth via Auth.js, which handles the OAuth flow and session cookies without a custom user/password system. On sign-in, the authenticated GitHub username is checked against an `owner` GitHub username (a single configured value) and a `trusted_users` table (admin-managed allow-list of GitHub usernames) to resolve the session's role. Unauthenticated requests are always `visitor`.
**Alternatives considered**: A custom credentials-based auth system was rejected — it would require building password storage, reset flows, etc., for no benefit when every expected user already has a GitHub account.

### Article authoring: in-app Markdown editor, database as sole source of truth
The admin UI includes a Markdown textarea with a live preview pane (e.g. `@uiw/react-md-editor` or an equivalent CodeMirror-based component) backed by a Server Action that writes directly to the `articles` table. There is no local-Markdown-file workflow and no sync step.
**Alternatives considered**: A "write locally, paste into admin" hybrid was rejected per proposal discussion — two sources of truth invite drift (e.g. a category change in the DB not reflected in a local file).

### UI: Tailwind CSS + shadcn/ui, card-based layout
Article listings (home, category, tag, search results) render as a responsive card grid; article detail pages render the rendered Markdown in a single-column reading layout. Tailwind + shadcn/ui give a fast path to a clean, consistent card aesthetic without hand-rolling a design system.

### Data model (high level)
- `articles`: id, title, slug, content (markdown), category_id, status (`draft`|`private`|`public`), created_at, updated_at, search vector (generated column).
- `categories`: id, name, slug (flat hierarchy for v1, per "one category per article" decision).
- `tags`: id, name, slug; `article_tags`: join table (many-to-many).
- `trusted_users`: github_username, added_at (admin-managed allow-list; the `owner` is a single configured GitHub username, not a DB row).

## Risks / Trade-offs

- **[Risk]** Vercel's Hobby (free) tier terms restrict commercial use → **Mitigation**: this is explicitly a personal, non-commercial site, which fits the Hobby tier's intended use; revisit if the site ever monetizes.
- **[Risk]** Neon's serverless Postgres scales to zero, so the first request after idle time has extra cold-start latency → **Mitigation**: acceptable for a low-traffic personal blog; not a UX-critical path.
- **[Risk]** Postgres `tsvector` full-text search has weaker relevance ranking than a dedicated search engine (no semantic/fuzzy matching) → **Mitigation**: acceptable at personal-blog content volume; can be revisited later without changing the permission-filtering approach if search quality becomes a real problem.
- **[Risk]** GitHub OAuth is a hard dependency for login — a GitHub outage blocks the author from reaching private content → **Mitigation**: accepted trade-off in exchange for not building a custom auth system; public content remains reachable regardless.
- **[Risk]** Role is allow-list-based, not per-article — granting `trusted` access exposes *all* `private` articles to that person, not a curated subset → **Mitigation**: this is the explicitly chosen trade-off (role-based over per-article ACLs) for lower management overhead; revisit only if a real need for finer-grained sharing appears.

## Migration Plan

Greenfield project — no existing system to migrate from or roll back to. Initial setup sequence:
1. Provision a Neon Postgres project; run initial Drizzle migrations to create the schema.
2. Register a GitHub OAuth App; configure Auth.js with the client ID/secret and the `owner` GitHub username.
3. Create a Vercel project linked to this GitHub repository; configure environment variables (DB connection string, OAuth credentials, NextAuth secret, owner username).
4. Push to the connected branch to trigger the first deploy; verify OAuth login and role resolution end-to-end before writing real content.

## Open Questions

- How are categories and tags created — only inline while authoring an article, or also via a small standalone admin management view? (Does not block initial implementation; can default to "create inline, list existing for reuse.")
- Is image upload/hosting in scope for v1 articles, or are images out of scope until a later change? Not raised during exploration — flagged here rather than assumed.
- Should `trusted_users` management (adding/removing allow-listed GitHub usernames) have an admin UI in v1, or is direct database/config editing acceptable initially?
