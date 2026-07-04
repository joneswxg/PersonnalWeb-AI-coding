# Personal Learning Blog

Personal learning blog built with Next.js, React, TypeScript, Drizzle ORM, and Vitest.

## Development

```sh
npm install
./scripts/dev.sh
```

## Checks

```sh
./scripts/lint.sh
./scripts/test.sh
./scripts/check.sh
```

`./scripts/check.sh` runs lint, typecheck, tests, and build.

## Workflow

See [Development Workflow](docs/development-workflow.md) for the standard direct-change flow, OpenSpec flow, verify-before-archive rule, and git worktree guidance.

## Project Structure

- `AGENTS.md` - Codex and AI agent guidance.
- `docs/` - Architecture, testing, and review notes.
- `scripts/` - Stable command wrappers.
- `.codex/` - Codex configuration, rules, hooks, and skills.
- `.github/codex/prompts/` - Prompt assets for Codex workflows.
- `.github/workflows/` - Future GitHub Actions workflows.
- `src/` - Application source code.
- `drizzle/` - Database migrations.
- `openspec/` - OpenSpec workflow artifacts.

## Documentation

- [Architecture](docs/architecture.md)
- [Development Workflow](docs/development-workflow.md)
- [Testing](docs/testing.md)
- [Code Review](docs/code_review.md)
