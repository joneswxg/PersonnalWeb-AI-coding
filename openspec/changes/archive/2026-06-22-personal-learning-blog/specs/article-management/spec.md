## ADDED Requirements

### Requirement: Admin-Only Authoring Access
The system SHALL restrict article creation and editing to the `owner` role.

#### Scenario: Owner accesses the editor
- **WHEN** a request with role `owner` opens the article editor
- **THEN** the system allows access to create and edit articles

#### Scenario: Non-owner attempts to access the editor
- **WHEN** a request with role `visitor` or `trusted` attempts to access the article editor or any article-write endpoint
- **THEN** the system rejects the request

### Requirement: Markdown Article Authoring
The system SHALL provide an in-app Markdown editor with live preview that writes article content directly to the database as the sole source of truth.

#### Scenario: Create a new article
- **WHEN** the `owner` writes Markdown content and saves a new article
- **THEN** the system persists the article content, title, and metadata to the database

#### Scenario: Edit an existing article
- **WHEN** the `owner` modifies the content or metadata of an existing article and saves
- **THEN** the system updates the stored article in place and records an updated timestamp

### Requirement: Publication State Machine
Every article SHALL have a publication status of `draft`, `private`, or `public`, and the `owner` SHALL be able to transition an article between any of these statuses.

#### Scenario: New article starts as draft
- **WHEN** the `owner` creates a new article without explicitly publishing it
- **THEN** the system sets its status to `draft`

#### Scenario: Publish a draft as private
- **WHEN** the `owner` transitions an article from `draft` to `private`
- **THEN** the system updates its status to `private` and it becomes visible to `trusted` and `owner` roles per the content-browsing and content-search capabilities

#### Scenario: Publish as public
- **WHEN** the `owner` transitions an article to `public`
- **THEN** the system updates its status to `public` and it becomes visible to all roles

#### Scenario: Revert a published article to draft
- **WHEN** the `owner` transitions a `private` or `public` article back to `draft`
- **THEN** the system updates its status to `draft` and it becomes visible only within the admin editor

### Requirement: Category Assignment
Each article SHALL be assigned to exactly one category.

#### Scenario: Assign a category when authoring
- **WHEN** the `owner` saves an article with a selected category
- **THEN** the system associates the article with that single category

#### Scenario: Reassign category
- **WHEN** the `owner` changes an article's category and saves
- **THEN** the system updates the article's category association, replacing the previous one

### Requirement: Tag Assignment
Each article SHALL support zero or more free-form tags.

#### Scenario: Add tags to an article
- **WHEN** the `owner` adds one or more tags to an article and saves
- **THEN** the system associates all specified tags with the article

#### Scenario: Remove a tag from an article
- **WHEN** the `owner` removes a tag from an article and saves
- **THEN** the system removes that tag's association with the article without affecting other articles using the same tag
