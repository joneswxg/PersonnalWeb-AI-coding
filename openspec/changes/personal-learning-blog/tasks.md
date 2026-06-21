## 1. Project Setup

- [x] 1.1 Initialize a Next.js (App Router, TypeScript) project in the repo
- [x] 1.2 Add Tailwind CSS and shadcn/ui for the card-based UI
- [x] 1.3 Add Drizzle ORM and configure the Postgres client
- [ ] 1.4 Provision a Neon Postgres project and store the connection string as an environment variable (manual — local dev uses docker-compose Postgres in the meantime; see `.env.example`)
- [ ] 1.5 Register a GitHub OAuth App and configure Auth.js with the GitHub provider (manual — Auth.js code is wired up and reads `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` from env; app registration itself needs to happen on github.com)
- [ ] 1.6 Create a Vercel project linked to this GitHub repository and configure required environment variables (DB connection string, OAuth client ID/secret, NextAuth secret, owner GitHub username) (manual — deferred to section 7)

## 2. Data Model & Migrations

- [x] 2.1 Define the `articles` table schema (title, slug, content, category_id, status, timestamps)
- [x] 2.2 Define the `categories` table schema
- [x] 2.3 Define the `tags` table and `article_tags` join table schema
- [x] 2.4 Define the `trusted_users` table schema (GitHub username allow-list)
- [x] 2.5 Add a generated `tsvector` column on `articles` with a GIN index for full-text search
- [x] 2.6 Generate and run the initial migration against Neon (run against local docker-compose Postgres for now; same migration applies to Neon once 1.4 is done)

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

- [ ] 7.1 Deploy to Vercel via the GitHub integration and verify auto-deploy on push
- [ ] 7.2 Verify GitHub OAuth login end-to-end in the deployed environment
- [ ] 7.3 Verify owner role resolution and the trusted-user allow-list flow in the deployed environment
- [ ] 7.4 Smoke-test the full visibility matrix (visitor/trusted/owner × draft/private/public) across listing, detail, and search in the deployed environment
