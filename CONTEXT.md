# Personal Portfolio

A public professional profile that presents the owner’s career narrative and verifiable engineering work for recruiters first and technical peers second.

## Language

**Portfolio Profile**:
The owner’s public professional identity, including the biographical, career, education, skills, project, and certification information intended for the portfolio.
_Avoid_: Personal homepage, resume page, profile card

**Portfolio Home**:
The recruiter-first landing page that presents the Portfolio Profile, selected work, and evidence of engineering practice, while directing deeper reading to the Technical Journal.
_Avoid_: Blog homepage, dashboard, landing page

**Technical Journal**:
The retained collection of published technical articles that provides deeper evidence of the owner’s engineering thinking.
_Avoid_: Learning blog, article archive, notes

**GitHub Identity**:
The public GitHub account, `joneswxg`, whose repositories and activity provide portfolio evidence.
_Avoid_: Login account, GitHub OAuth user, repository owner

**Git-Managed Profile Data**:
The version-controlled Markdown portfolio content that defines the owner’s profile, career narrative, skills, education, certifications, and editorial project choices. It is maintained through GitHub commits rather than an application database or in-site editor.
_Avoid_: Profile database, CMS profile, admin profile

**Chinese Portfolio**:
The initial public-language presentation of the Portfolio Home. English localization is available as an alternate presentation when its translated content is supplied.
_Avoid_: Chinese-only site, default locale

**Personal Project Selection**:
The curated eligibility rule for Portfolio Projects: public, non-archived, non-fork repositories are included automatically; editorial exclusions and substantively modified forks are recorded in Git-Managed Profile Data.
_Avoid_: All public repositories, automatic repository list

**Project Overview**:
The concise public summary of a Portfolio Project: its name, description, topics, primary technologies, current GitHub signals, and link to the repository.
_Avoid_: Project card, repository metadata, GitHub preview

**Career Experience**:
The chronological public account of the owner’s professional roles, responsibilities, and outcomes.
_Avoid_: Work history, employment record, career timeline

**Educational Background**:
The public account of the owner’s formal education and relevant academic achievements.
_Avoid_: Education, schooling, degree list

**Professional Certification**:
A verifiable credential or completed professional training that is relevant to the owner’s career narrative.
_Avoid_: Course, badge, training

**Featured Project**:
An intentionally selected Portfolio Project that represents the owner’s strongest work, has a detailed portfolio narrative, and links to its public GitHub repository.
_Avoid_: Repository, GitHub project, project card

**Portfolio Project**:
A public, non-archived repository admitted to the portfolio because it is the owner’s original work or contains verifiable substantive modifications with transparent upstream attribution. Tutorials, tests, pure upstream mirrors, and explicitly excluded repositories are not Portfolio Projects.
_Avoid_: Original project, all repositories, GitHub project

**Project Attribution**:
The public account of a Portfolio Project’s upstream origin and the owner’s substantive modifications when the repository is a fork.
_Avoid_: Fork badge, credit note

**Public Project Directory**:
The browsable list of Portfolio Projects, each linking to its corresponding GitHub repository.
_Avoid_: All repositories, repo list

**Owner Activity**:
A time-bounded aggregation of changes attributed to the owner within eligible repositories, used as evidence of current engineering practice.
_Avoid_: My activity, contribution count

**Project Health**:
The current and time-bounded maintenance state of eligible repositories, independent of who performed each action.
_Avoid_: Repository Activity, project status

**GitHub Activity Dashboard**:
The visual and numeric presentation of Owner Activity and Project Health on the projects page.
_Avoid_: GitHub profile widget, contribution graph

**Activity Window**:
An explicitly labeled calendar interval in the `Asia/Shanghai` timezone. A portfolio week begins Monday at 00:00; rolling windows state their duration, such as 30 days or 12 weeks.
_Avoid_: This week, recent activity

**Activity Snapshot**:
The most recent successfully collected set of Portfolio Metrics, shown with its collection time when live GitHub data is unavailable. It is refreshed at most once per 24 hours.
_Avoid_: Cache, stale data, fallback data

**Media Asset**:
A public, immutable-addressed image owned by the portfolio and used in an article, Portfolio Profile, or Featured Project. It remains stored until the owner explicitly deletes it after reviewing known references.
_Avoid_: Upload, image file, static content

**Media Provider**:
The object-storage service that owns a Media Asset and must service its deletion. New assets use R2, while legacy assets can remain on Supabase until separately migrated.
_Avoid_: Bucket, CDN, storage URL

**Portfolio Metric**:
A clearly scoped, source-labeled aggregate that supports a claim about the owner’s public work: eligible project count, projects with owner-authored commits in the 30-day Activity Window, most recent owner-authored commit date, or primary-language distribution.
_Avoid_: GitHub stat, vanity metric, total code
