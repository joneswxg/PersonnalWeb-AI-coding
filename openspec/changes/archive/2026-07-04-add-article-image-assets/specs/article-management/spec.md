## ADDED Requirements

### Requirement: Owner-Managed Article Image Upload
The system SHALL allow the `owner` to upload article images from the admin authoring experience and persist a managed media asset record for each accepted upload.

#### Scenario: Owner uploads a supported image
- **WHEN** a request with role `owner` uploads a `image/jpeg`, `image/png`, or `image/webp` file not exceeding 10 MB from the admin article editor
- **THEN** the system stores the object in the configured Supabase Storage bucket and creates a media asset record containing its storage location and metadata

#### Scenario: Non-owner attempts image upload
- **WHEN** a request with role `visitor` or `trusted` attempts to upload an article image
- **THEN** the system rejects the request and stores no object or media asset record

#### Scenario: Unsupported file type is uploaded
- **WHEN** the `owner` uploads a file whose MIME type is not `image/jpeg`, `image/png`, or `image/webp`
- **THEN** the system rejects the upload and stores no object or media asset record

#### Scenario: Oversized image is uploaded
- **WHEN** the `owner` uploads an image larger than 10 MB
- **THEN** the system rejects the upload and stores no object or media asset record

### Requirement: Media Asset Metadata Tracking
The system SHALL track uploaded article images as managed media assets, storing enough metadata to support insertion, display, and deletion independently of raw Markdown text.

#### Scenario: Uploaded asset metadata is recorded
- **WHEN** an article image upload succeeds
- **THEN** the system records the bucket name, object path, public URL, MIME type, file size, and optional alt text for that uploaded asset

#### Scenario: Asset may exist before article content references it
- **WHEN** the `owner` uploads an image during authoring before inserting it into article Markdown
- **THEN** the system preserves the asset record so it can be inserted later from the admin workflow

### Requirement: Markdown Image Insertion From Managed Assets
The system SHALL let the `owner` insert a managed uploaded image into article content as Markdown using the asset's public URL.

#### Scenario: Insert uploaded asset into Markdown
- **WHEN** the `owner` chooses an uploaded image asset from the admin article editor
- **THEN** the system inserts Markdown image syntax referencing that asset's public URL into the article content

#### Scenario: Insert uploaded asset with alt text
- **WHEN** the chosen uploaded image asset has alt text
- **THEN** the inserted Markdown uses that alt text in the generated image syntax

#### Scenario: Insert uploaded asset without alt text
- **WHEN** the chosen uploaded image asset has no alt text
- **THEN** the inserted Markdown still references the asset's public URL and uses an empty alt text value

### Requirement: Managed Article Image Deletion
The system SHALL allow the `owner` to delete a managed article image and SHALL delete both the media asset record and the corresponding Supabase Storage object.

#### Scenario: Owner deletes an uploaded image
- **WHEN** the `owner` deletes a managed article image from the admin system
- **THEN** the system deletes the corresponding Supabase Storage object and removes the media asset record

#### Scenario: Remote object deletion fails
- **WHEN** the `owner` requests deletion of a managed article image and the Supabase Storage object cannot be deleted
- **THEN** the system preserves the media asset record and reports the deletion failure

#### Scenario: Non-owner attempts image deletion
- **WHEN** a request with role `visitor` or `trusted` attempts to delete a managed article image
- **THEN** the system rejects the request and deletes neither the Supabase object nor the media asset record
