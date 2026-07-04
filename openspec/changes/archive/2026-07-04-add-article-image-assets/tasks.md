## 1. Data Model And Storage Integration

- [x] 1.1 Add the `media_assets` database schema and migration, including fields for bucket, object path, public URL, MIME type, size, optional alt text, and optional article linkage
- [x] 1.2 Add runtime configuration and a server-side Supabase S3 integration layer for upload and delete operations
- [x] 1.3 Implement upload validation for MIME type and 10 MB size limits before remote storage writes

## 2. Admin Authoring Workflow

- [x] 2.1 Add owner-only server actions for uploading and deleting managed article image assets
- [x] 2.2 Extend the admin article editor UI to upload images, capture optional alt text, and list uploaded assets for the current editing workflow
- [x] 2.3 Add editor actions to insert selected managed assets into Markdown as image syntax using the asset public URL

## 3. Verification

- [x] 3.1 Add focused tests for media asset validation, persistence, and deletion behavior
- [x] 3.2 Run end-to-end manual verification against the configured Supabase bucket for upload, insert, and delete flows
- [x] 3.3 Run `./scripts/check.sh` and resolve any failures before implementation is considered complete
