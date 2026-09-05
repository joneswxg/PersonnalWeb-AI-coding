# Git-Managed Profile Data

`content/portfolio-profile.md` is the source of truth for the public Portfolio
Profile content. It is intentionally maintained through Git commits: there
is no profile database and no in-site editor.

## Editing workflow

1. Edit the JSON fenced block between the `portfolio-profile:start` and
   `portfolio-profile:end` markers.
2. Keep `version` set to `1`.
3. Run `npm test -- src/lib/__tests__/portfolio-profile.test.ts` and
   `npm run typecheck`.
4. Run `./scripts/check.sh` before handoff or commit.
5. Commit the Markdown change through the normal repository workflow.

The parser rejects missing required values, unsupported versions, invalid JSON,
and non-HTTPS public URLs. The avatar is an HTTPS Media Asset reference; the
binary image must not be committed to this repository. Replace its `src` with
the immutable public URL returned by the configured Media Provider.

## Localized values

Localized text uses this shape:

```json
{ "zh": "必填中文内容", "en": "Optional English translation" }
```

`zh` is required. `en` is optional. The Chinese Portfolio is the default. In
the English presentation, each missing `en` value falls back independently to
its `zh` value; content is never translated automatically.

## Schema

- `profile` defines the public name, professional title, summary, optional
  gender and location, avatar, and GitHub Identity URL.
- `skills` groups localized skill names under localized category names.
- `experience` defines Career Experience entries with organization, role,
  dates, summary, and outcome highlights.
- `education` defines Educational Background entries. `details` is optional.
- `certifications` defines Professional Certification entries.
  `credentialUrl` is optional and must use HTTPS when present.
- `featuredProjects` lists exactly three distinct repository names selected for
  Featured Project treatment. Each name must resolve to an eligible Portfolio
  Project after exclusions and attributed-fork admissions are applied.
- `projectRules.excludedRepositories` lists repositories excluded by editorial
  choice.
- `projectRules.admittedForks` explicitly admits a substantively modified fork
  and must record its repository, upstream repository, and localized Project
  Attribution.

The four Portfolio Profile section arrays may be empty. The Portfolio Home renders a clear empty
state for any section whose content has not yet been supplied.
