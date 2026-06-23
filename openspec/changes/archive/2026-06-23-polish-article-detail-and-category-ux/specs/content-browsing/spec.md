## ADDED Requirements

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
