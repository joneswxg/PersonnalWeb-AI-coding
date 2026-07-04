# Testing

## Commands

```sh
./scripts/test.sh
./scripts/lint.sh
./scripts/check.sh
```

`./scripts/check.sh` is the default definition of done for Codex tasks. It runs lint, typecheck, tests, and build in order.

## Current Test Runner

The project uses Vitest via `npm run test`.

Type checking uses `npm run typecheck`.

## Guidance

- Add unit tests for pure logic in `src/lib/`.
- Add integration tests when behavior crosses article queries, permissions, database access, or search.
- Keep test fixtures small and explicit.
- Run focused tests while developing and `./scripts/check.sh` before handoff when practical.

## Open Questions

- Whether integration tests require a local database or mocked database layer.
- Required coverage threshold.
- CI test matrix.
