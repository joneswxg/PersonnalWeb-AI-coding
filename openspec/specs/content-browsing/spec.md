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
