## Why

The admin article workflow currently supports only text-first Markdown authoring, which forces images to be hosted and inserted manually outside the system. Adding first-party image upload now removes that friction and establishes a managed media path before more articles depend on ad hoc external image hosting.

## What Changes

- Add owner-only image upload to the admin article authoring flow.
- Add managed media asset records for uploaded article images, including storage location, public URL, MIME type, size, and optional alt text.
- Allow the owner to insert uploaded images into Markdown content from the article editor.
- Enforce image upload constraints: `image/jpeg`, `image/png`, and `image/webp`, with a maximum file size of 10 MB.
- Delete the underlying Supabase Storage object when an uploaded image asset is removed from the admin system.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `article-management`: extend article authoring to support owner-managed image upload, media asset tracking, Markdown image insertion, and managed image deletion.

## Impact

- Affected code: admin article pages, Markdown editor UI, article actions, database schema, and supporting domain logic for media assets.
- External systems: Supabase Storage S3-compatible bucket `personalweb-images`.
- Dependencies and configuration: S3 client integration, storage environment variables, upload limits, and media asset persistence.
