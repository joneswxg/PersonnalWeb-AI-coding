## Purpose

Admin-side authoring: the online Markdown editor, categories, tags, and the draft/private/public state machine for articles.

## Requirements

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
Each article SHALL be assigned to exactly one category, selected from the set of categories that already exist. The system SHALL NOT create a category implicitly as a side effect of saving an article.

#### Scenario: Assign a category when authoring
- **WHEN** the `owner` saves an article with a category selected from the existing category list
- **THEN** the system associates the article with that single category

#### Scenario: Reassign category
- **WHEN** the `owner` changes an article's category to another existing category and saves
- **THEN** the system updates the article's category association, replacing the previous one

#### Scenario: No category can be created from the article form
- **WHEN** the `owner` is authoring or editing an article
- **THEN** the system only offers a choice among categories that already exist, and provides no way to create a new category from that form

### Requirement: Tag Assignment
Each article SHALL support zero or more free-form tags.

#### Scenario: Add tags to an article
- **WHEN** the `owner` adds one or more tags to an article and saves
- **THEN** the system associates all specified tags with the article

#### Scenario: Remove a tag from an article
- **WHEN** the `owner` removes a tag from an article and saves
- **THEN** the system removes that tag's association with the article without affecting other articles using the same tag

### Requirement: Category Lifecycle Management
The system SHALL allow the `owner` to create, rename, and delete categories independently of authoring an article. The system SHALL always retain at least one category, and deleting a category SHALL require reassigning its articles to another category rather than leaving them uncategorized.

#### Scenario: Owner creates a category
- **WHEN** the `owner` submits a name for a new category
- **THEN** the system creates the category, available for assignment to articles

#### Scenario: Owner renames a category
- **WHEN** the `owner` changes a category's display name and saves
- **THEN** the system updates the category's name, and articles previously assigned to it remain assigned to it

#### Scenario: Owner deletes a category with a migration target
- **WHEN** the `owner` deletes a category and selects another existing category as the migration target
- **THEN** the system reassigns every article previously in the deleted category to the migration target category, then deletes the category

#### Scenario: Owner attempts to delete the only category
- **WHEN** the `owner` attempts to delete a category and no other category exists to serve as a migration target
- **THEN** the system rejects the deletion and makes no change, since at least one category must always exist

#### Scenario: Non-owner attempts to manage categories
- **WHEN** a request with role `visitor` or `trusted` attempts to create, rename, or delete a category
- **THEN** the system rejects the request

### Requirement: Article Deletion
The system SHALL allow the `owner` to permanently delete an article, including its tag associations.

#### Scenario: Owner deletes an article
- **WHEN** the `owner` confirms deletion of an article
- **THEN** the system permanently removes the article and its tag associations

#### Scenario: Non-owner attempts to delete an article
- **WHEN** a request with role `visitor` or `trusted` attempts to delete an article
- **THEN** the system rejects the request

### Requirement: Admin Article List Filtering and Search
The system SHALL allow the `owner` to filter the admin article list by publication status and by category, and to search it by title, independently of the permission-filtered full-text search used by visitors.

#### Scenario: Filter by status
- **WHEN** the `owner` selects a publication status filter in the admin article list
- **THEN** the system shows only articles with that status

#### Scenario: Filter by category
- **WHEN** the `owner` selects a category filter in the admin article list
- **THEN** the system shows only articles in that category

#### Scenario: Search by title
- **WHEN** the `owner` enters a search term in the admin article list
- **THEN** the system shows only articles whose title matches the search term
