## MODIFIED Requirements

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
