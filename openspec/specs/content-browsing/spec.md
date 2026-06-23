## Purpose

The public-facing reading experience: card-based article listing, category/tag navigation, and article detail rendering, all filtered by the viewer's role.

## Requirements

### Requirement: Role-Filtered Card Listing
The system SHALL render article listings as a card-based grid, showing only articles whose status is permitted for the viewer's resolved role.

#### Scenario: Visitor views the listing
- **WHEN** a request with role `visitor` views an article listing
- **THEN** the system shows only `public` articles

#### Scenario: Trusted or owner views the listing
- **WHEN** a request with role `trusted` or `owner` views an article listing
- **THEN** the system shows `public` and `private` articles

#### Scenario: Draft articles never appear in listings
- **WHEN** any request, regardless of role, views an article listing
- **THEN** the system excludes `draft` articles from the listing

### Requirement: Category and Tag Navigation
The system SHALL allow visitors to filter the article listing by category and by tag, applying the same role-based visibility rules as the unfiltered listing.

#### Scenario: Filter by category
- **WHEN** a viewer selects a category
- **THEN** the system shows only articles in that category that are visible to the viewer's role

#### Scenario: Filter by tag
- **WHEN** a viewer selects a tag
- **THEN** the system shows only articles with that tag that are visible to the viewer's role

### Requirement: Role-Enforced Article Detail Access
The system SHALL enforce role-based visibility on direct access to an individual article's detail page, independent of how the viewer navigated there.

#### Scenario: Visitor requests a public article directly
- **WHEN** a request with role `visitor` requests the detail page of a `public` article by URL
- **THEN** the system renders the article

#### Scenario: Visitor requests a private article directly
- **WHEN** a request with role `visitor` requests the detail page of a `private` or `draft` article by URL
- **THEN** the system denies access and does not render the article content

#### Scenario: Trusted user requests a private article directly
- **WHEN** a request with role `trusted` requests the detail page of a `private` article by URL
- **THEN** the system renders the article

#### Scenario: Draft articles are never reachable via the public detail page, including for the owner
- **WHEN** any request, regardless of role (including `owner`), requests the detail page of a `draft` article by URL
- **THEN** the system denies access; drafts are only reachable through the admin editor

### Requirement: Duplicate Title Suppression in Article Detail Rendering
When rendering an article's detail page, if the article body's first line is a level-1 Markdown heading whose text matches the article's title (case-insensitive, ignoring leading/trailing whitespace), the system SHALL omit that heading line from the rendered body, since the title is already rendered separately above it.

#### Scenario: Body opens with a heading duplicating the title
- **WHEN** an article's stored content begins with a line `# <title>` where `<title>` matches the article's title (case-insensitive, trimmed)
- **THEN** the system renders the article's title once, and the rendered body omits that leading heading line while rendering the rest of the content unchanged

#### Scenario: Body opens with an unrelated heading
- **WHEN** an article's stored content begins with a level-1 heading whose text does not match the article's title
- **THEN** the system renders that heading as part of the body, unchanged

#### Scenario: A matching heading appears later in the body, not as the first line
- **WHEN** an article's stored content contains a line matching the title as a level-1 heading, but it is not the first line of the content
- **THEN** the system renders that heading unchanged, since only a leading duplicate heading is suppressed
