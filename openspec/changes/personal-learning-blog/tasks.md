## 1. Project Setup

- [x] 1.1 Initialize a Next.js (App Router, TypeScript) project in the repo
- [x] 1.2 Add Tailwind CSS and shadcn/ui for the card-based UI
- [x] 1.3 Add Drizzle ORM and configure the Postgres client
- [x] 1.4 Provision a Neon Postgres project and store the connection string as an environment variable
- [x] 1.5 Register a GitHub OAuth App and configure Auth.js with the GitHub provider
- [x] 1.6 Create a Vercel project linked to this GitHub repository and configure required environment variables (DB connection string, OAuth client ID/secret, NextAuth secret, owner GitHub username)

## 2. Data Model & Migrations

- [x] 2.1 Define the `articles` table schema (title, slug, content, category_id, status, timestamps)
- [x] 2.2 Define the `categories` table schema
- [x] 2.3 Define the `tags` table and `article_tags` join table schema
- [x] 2.4 Define the `trusted_users` table schema (GitHub username allow-list)
- [x] 2.5 Add a generated `tsvector` column on `articles` with a GIN index for full-text search
- [x] 2.6 Generate and run the initial migration against Neon

## 3. Access Control (`access-control`)

- [x] 3.1 Implement Auth.js session handling with the GitHub provider
- [x] 3.2 Implement role-resolution logic (`visitor`/`trusted`/`owner`) from session identity, the configured owner username, and the `trusted_users` allow-list
- [x] 3.3 Implement a server-side authorization helper used by every read/write path that needs role information
- [x] 3.4 Implement owner-only add/remove actions for the `trusted_users` allow-list
- [x] 3.5 Add tests covering role resolution: unauthenticated, owner, allow-listed trusted user, and authenticated-but-not-allow-listed

## 4. Article Management (`article-management`)

- [x] 4.1 Add an admin-only route guard for the editor UI and all article-write actions
- [x] 4.2 Build the Markdown editor UI with a live preview pane
- [x] 4.3 Implement the create-article action, defaulting new articles to `draft`
- [x] 4.4 Implement the edit-article action for content and metadata updates
- [x] 4.5 Implement the publication-status transition action supporting `draft`/`private`/`public` in any direction
- [x] 4.6 Implement single-category assignment per article
- [x] 4.7 Implement multi-tag assignment (add/remove) per article
- [x] 4.8 Add tests covering state-machine transitions and admin-only enforcement

## 5. Content Browsing (`content-browsing`)

- [x] 5.1 Implement a role-filtered article query for listings that always excludes `draft`
- [x] 5.2 Build the card-based listing UI (home page)
- [x] 5.3 Build category filter navigation and view
- [x] 5.4 Build tag filter navigation and view
- [x] 5.5 Build the article detail page with role-enforced access (deny `private`/`draft` to unauthorized roles, including direct URL access)
- [x] 5.6 Add tests for direct-URL access enforcement across the visitor/trusted/owner × draft/private/public matrix

## 6. Content Search (`content-search`)

- [x] 6.1 Implement the server-side full-text search query (`tsvector`/`tsquery`) with role filtering applied in the same query
- [x] 6.2 Build the search UI (input + card-based results)
- [x] 6.3 Verify no pre-built search index or bulk article content is present in any client-delivered asset
- [x] 6.4 Add tests for role-filtered search results and draft exclusion

## 7. Deployment & Verification

- [x] 7.1 Deploy to Vercel via the GitHub integration and verify auto-deploy on push
- [x] 7.2 Verify GitHub OAuth login end-to-end in the deployed environment (owner confirmed logging in via the deployed site)
- [x] 7.3 Verify owner role resolution in the deployed environment (owner confirmed seeing the "Articles"/"Trusted users" admin nav after login); trusted-user allow-list flow not manually verified against a second GitHub account, but is covered by automated tests (`roles.test.ts`)
- [x] 7.4 Smoke-test article visibility in the deployed environment (owner confirmed creating an article and toggling draft/private/public; confirmed a logged-out visitor sees only `public` articles on the home page). Full visitor/trusted/owner × draft/private/public matrix across listing/detail/search is covered by automated integration tests (`article-queries.integration.test.ts`, `search.integration.test.ts`), not exhaustively re-verified by hand in production
