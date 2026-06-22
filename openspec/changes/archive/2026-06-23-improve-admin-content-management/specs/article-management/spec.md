## ADDED Requirements

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
