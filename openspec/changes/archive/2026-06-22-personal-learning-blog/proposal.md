## Why

There is currently no way to capture and revisit daily learning notes in a structured, searchable way. Ad-hoc notes get lost and don't accumulate into something reviewable. A personal site is needed where occasional, well-structured articles can be written, organized, and later searched — with most content kept private to the author (and optionally a small set of trusted people), while a subset can be shared publicly.

## What Changes

- Introduce a full-stack personal blog/knowledge-base application (not a static site), since per-article visibility and permission-filtered search require server-side logic.
- Add an online Markdown editor (admin-only) for writing and editing articles directly against the database — no local-file sync step.
- Add a per-article publication state machine: `draft` → `private` → `public`, with the ability to move backward (e.g. `public` → `private`, or back to `draft` for rework).
- Add hierarchical categories (one category per article) and free-form tags (many per article).
- Add GitHub OAuth login and a role model: `visitor` (unauthenticated, sees `public` only), `trusted` (authenticated + allow-listed, sees `public` + `private`), `owner` (full read + admin access).
- Add server-side full-text search that filters results by the requester's role before returning them — explicitly excluding any approach that ships a pre-built static search index to the client, since that would leak `private` content regardless of UI gating.
- Add a card-based public reading UI (category browsing, tag filtering, article detail view) that respects the role-based visibility rules above.
- Deploy via GitHub-repo-triggered auto-deploy to a serverless hosting platform (no self-managed servers) backed by a managed database service (no self-managed database), targeting free-tier usage for personal-scale traffic.

## Capabilities

### New Capabilities
- `access-control`: GitHub OAuth authentication, the visitor/trusted/owner role model, and admin management of the trusted-user allow-list.
- `article-management`: admin-side authoring — online Markdown editor, categories, tags, and the draft/private/public state machine for articles.
- `content-browsing`: public-facing reading experience — card-based article listing, category/tag navigation, article detail rendering, all filtered by the viewer's role.
- `content-search`: server-side full-text search across articles, with results filtered by the requester's role.

### Modified Capabilities
- None — this is a greenfield project with no existing specs.

## Impact

- New application codebase (currently none exists in this repo): frontend, backend/API, and database schema.
- New external dependencies: a GitHub OAuth app registration, a serverless hosting platform account, and a managed database service account (specific providers to be selected in `design.md`).
- New deployment pipeline: GitHub repository pushes trigger automatic builds/deploys.
- No existing capabilities or specs are affected, since none exist yet.
