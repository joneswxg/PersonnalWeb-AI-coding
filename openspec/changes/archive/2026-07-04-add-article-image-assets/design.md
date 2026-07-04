## Context

The current admin authoring flow is text-only: article content is stored as Markdown in the `articles` table, rendered through `react-markdown`, and edited through a textarea-based live preview editor. There is no existing concept of a managed media asset, no upload pipeline, and no article-scoped image lifecycle. The chosen storage backend is a Supabase Storage S3-compatible bucket named `personalweb-images`, configured as a public bucket.

This change introduces a new data model and an external storage integration while keeping the existing article content model intact. Images remain referenced from Markdown content rather than introducing a structured rich-text document model.

## Goals / Non-Goals

**Goals:**
- Let the `owner` upload article images directly from the admin editing flow.
- Persist uploaded image metadata in the application database so assets can be managed independently of raw Markdown text.
- Insert uploaded images into article Markdown using stable public URLs from the Supabase public bucket.
- Enforce upload constraints: JPEG, PNG, and WebP only, maximum 10 MB.
- Allow managed deletion of uploaded assets, including deleting the corresponding object from Supabase Storage.

**Non-Goals:**
- Replacing the Markdown editor with a rich-text or drag-and-drop media editor.
- Supporting private buckets, signed URLs, or viewer-specific image authorization in this change.
- Adding a site-wide media library with cross-article reuse workflows beyond the article editing experience.
- Implementing image transformations, resizing pipelines, or automatic alt-text generation.

## Decisions

### Extend `article-management` instead of creating a separate media capability
Image upload exists only to support article authoring in this product, so the requirements belong under the existing `article-management` capability rather than a new standalone media management capability. This keeps the spec aligned with the current product boundary: media is an authoring aid, not an independently surfaced product area.
**Alternative considered**: create a new `media-management` capability. Rejected because it would overstate the product boundary and split closely related authoring behavior across multiple specs.

### Use a dedicated `media_assets` table alongside Markdown content
The existing `articles.content` field remains the source of truth for article body content, including image references embedded as Markdown. Uploaded images are additionally tracked in a dedicated `media_assets` table containing storage coordinates and descriptive metadata. This preserves the simplicity of Markdown authoring while adding lifecycle control for uploaded images.
**Alternative considered**: store only image URLs inside Markdown with no database record. Rejected because deletion, auditability, and future media management would become unreliable once the URL is the only source of truth.

### Store both storage coordinates and the resolved public URL
Each media asset record stores `bucket`, `objectPath`, and `publicUrl`, plus metadata such as MIME type, size, and optional alt text. `publicUrl` keeps editor insertion simple for the public bucket case, while `bucket` and `objectPath` provide a stable handle for object deletion and future migrations.
**Alternative considered**: store only `publicUrl`. Rejected because it makes object deletion and future storage migrations harder than necessary.

### Keep uploads owner-only and server-mediated
Uploads and deletions are mediated by the application server and guarded by the existing `requireOwner` authorization path. This keeps the trust boundary consistent with every other article write action and avoids introducing a client-direct upload flow in the first version.
**Alternative considered**: browser-direct uploads to Supabase. Rejected because it adds credential, policy, and error-handling complexity without solving a current scale problem.

### Treat media deletion as a managed operation across DB and Supabase
Deleting an uploaded image from the admin system removes both the `media_assets` row and the corresponding object in Supabase Storage. The application should only delete the database record after the object deletion succeeds, or otherwise surface the failure so the system does not silently lose track of a still-existing remote object.
**Alternative considered**: delete only the database row and leave the remote object orphaned. Rejected because it would leak storage and make later cleanup difficult.

### Article linkage is optional at upload time
The media asset model should support assets uploaded from an existing article edit page and, if useful during authoring ergonomics, assets that are temporarily unattached or attached after insertion. This avoids forcing an immediate hard coupling between file upload timing and article save timing.
**Alternative considered**: require every uploaded image to be tied to an existing article row at upload time. Rejected because it complicates the new-article flow where the article may not yet exist.

## Risks / Trade-offs

- **[Risk]** Public bucket URLs make every uploaded image publicly reachable if someone knows the URL.  
  **Mitigation**: keep upload paths unguessable enough for ordinary use, scope uploads to owner-only admin flows, and accept this as the explicit trade-off of choosing a public bucket for a content blog.
- **[Risk]** Markdown content can outlive managed asset records if image URLs are pasted manually or assets are deleted after insertion.  
  **Mitigation**: provide insertion via managed uploads as the default workflow and keep deletion explicit in the admin UI.
- **[Risk]** Remote object deletion can fail after a database lookup but before state mutation completes.  
  **Mitigation**: sequence deletion so remote deletion happens first and only then remove the local record; surface failures instead of partially succeeding.
- **[Risk]** Introducing S3 integration adds configuration and test surface to a previously database-only authoring flow.  
  **Mitigation**: isolate storage access behind a small server-side integration layer and keep validation logic narrow and testable.

## Migration Plan

1. Add a database migration for the `media_assets` table and any required indexes/foreign keys.
2. Add environment-variable based Supabase S3 configuration for the application runtime.
3. Implement server-side upload and delete actions guarded by `requireOwner`.
4. Extend the article editor UI to upload, list, insert, and delete media assets.
5. Verify end-to-end locally against the configured Supabase bucket before deployment.
6. Deploy as a normal application release; no existing article content requires migration because Markdown remains the canonical article format.

Rollback is straightforward: disable the new UI and actions in code, and leave uploaded objects plus `media_assets` rows in place unless a deliberate cleanup is needed later.

## Open Questions

- Should the admin UI allow reusing assets uploaded for one article in another article, or should listing stay scoped to the current article/editor context?
- Should unattached uploads be allowed to persist indefinitely, or should a later cleanup policy remove old unattached assets?
