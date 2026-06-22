## ADDED Requirements

### Requirement: Server-Side Permission-Filtered Search
The system SHALL execute full-text search entirely server-side, filtering results by the requester's resolved role within the same query that performs the text match, before any results are transmitted to the client.

#### Scenario: Visitor searches
- **WHEN** a request with role `visitor` submits a search query
- **THEN** the system returns only matching `public` articles

#### Scenario: Trusted or owner searches
- **WHEN** a request with role `trusted` or `owner` submits a search query
- **THEN** the system returns matching `public` and `private` articles

#### Scenario: Draft articles are never searchable
- **WHEN** any request, regardless of role, submits a search query
- **THEN** the system excludes `draft` articles from the results

### Requirement: No Client-Side Search Index
The system SHALL NOT generate or transmit a pre-built search index (or any other artifact containing article text) to the client. Every search request SHALL be served by a fresh server-side query.

#### Scenario: Inspecting client-delivered assets
- **WHEN** any asset delivered to the browser (static files, bundles, or API responses outside of an explicit search request) is inspected
- **THEN** it contains no full-text search index or bulk listing of `private` or `draft` article content
