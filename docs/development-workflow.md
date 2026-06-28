# Development Workflow

This project supports two development lanes: a lightweight direct-change lane and an OpenSpec lane for larger or less certain work. Both lanes use the same verification gate before handoff, merge, or archive.

## Core Rule

Any completed `opsx:apply` implementation MUST enter a verify step and run:

```sh
./scripts/check.sh
```

Only archive an OpenSpec change after `./scripts/check.sh` passes. If the check fails, fix the failure and rerun the check before archive.

`./scripts/check.sh` runs lint, TypeScript typecheck, Vitest, and a production build in order.

## OpenSpec Feature Flow

Use this flow for new features, behavior changes with unclear scope, database changes, authorization changes, or work that benefits from written requirements.

1. Explore
   - Use `opsx:explore` to clarify the problem, inspect relevant code, compare options, and identify risks.
   - Do not implement application code during explore.

2. Propose
   - Use `opsx:propose <change-name>` to create the OpenSpec change artifacts.
   - Expected artifacts include `proposal.md`, `design.md`, `tasks.md`, and any delta specs required for the affected capabilities.

3. Apply
   - Use `opsx:apply <change-name>` to implement the tasks.
   - Keep edits scoped to the change.
   - Update task checkboxes as tasks are completed.
   - Add or update tests for changed behavior, especially data access, authorization, authentication, search, and database-related changes.

4. Verify
   - Run focused tests while developing when useful.
   - Run `./scripts/check.sh` after `opsx:apply` completes.
   - Treat any lint, typecheck, test, or build failure as blocking for archive.

5. Sync Specs
   - If the change contains delta specs, sync them back to `openspec/specs/` before or during archive.
   - Preserve existing main spec content that is not changed by the delta.

6. Archive
   - Use `opsx:archive <change-name>` only after verification passes.
   - Archive should preserve the completed proposal, design, tasks, and specs for future reference.

## Lightweight Feature Flow

Use this flow for small, well-understood changes that do not need a formal proposal.

1. Read the relevant code and follow existing patterns.
2. Implement the smallest scoped change that satisfies the request.
3. Add or update focused tests when behavior changes.
4. Run focused validation while developing.
5. Run `./scripts/check.sh` before handoff when practical.

If the change becomes ambiguous or expands in scope, switch to the OpenSpec flow before continuing.

## Git Worktree Flow

Git worktrees are compatible with OpenSpec and this workflow. A worktree is just another checkout of the same repository, so each feature can have its own branch, working directory, OpenSpec change, dev server, and verification run.

Recommended flow:

1. Create a branch and worktree from the main repository.

```sh
git worktree add ../personal-learning-blog-add-search-filters -b feature/add-search-filters
```

2. Work inside the new worktree.

```sh
cd ../personal-learning-blog-add-search-filters
```

3. Run the OpenSpec flow inside that worktree.
   - Create or apply one OpenSpec change per feature branch.
   - Keep the OpenSpec change name aligned with the branch name when practical.

4. Use separate local resources when needed.
   - If multiple worktrees run `./scripts/dev.sh` at the same time, use different dev server ports.
   - If database migrations differ across worktrees, avoid running incompatible branches against the same local database without resetting or using separate databases.

5. Verify in the same worktree that contains the code changes.

```sh
./scripts/check.sh
```

6. Merge through the normal Git path after verification passes.

## Worktree Guardrails

- Do not edit the same OpenSpec change from multiple worktrees at the same time.
- Do not archive a change in one worktree while another worktree still depends on that active change path.
- Prefer one branch, one worktree, one OpenSpec change for feature work.
- Keep `.env` local to each worktree and do not commit secrets.
- Be careful with generated or migration files. If two branches generate migrations independently, review ordering and conflicts before merge.
- Run `./scripts/check.sh` in the final branch/worktree state, not only in an earlier temporary state.

## When To Ask Before Proceeding

Ask for confirmation before dependency changes, database migrations, authentication changes, deployment changes, destructive Git operations, or environment changes. These are higher-risk operations under the repository command policy.
