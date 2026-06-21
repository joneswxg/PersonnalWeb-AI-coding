# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repository has no application code yet — no commits, no source files, an empty `README.md`. It currently contains only the scaffolding for two tools:

- **OpenSpec** (`openspec/` + `.claude/skills/openspec-*` + `.claude/commands/opsx/*`) — a spec-driven planning workflow, configured via `openspec/config.yaml` with `schema: spec-driven`.
- **oh-my-claudecode (OMC)** (`.omc/`) — session/state tracking for the Claude Code plugin.

There are no build, lint, or test commands because no project (package.json, etc.) has been initialized. When real source code is added, this file should be updated with the actual commands and architecture.

## OpenSpec workflow

This repo uses OpenSpec's "spec-driven" schema to plan and track changes before implementing them. The `openspec` CLI (v1.4.1, available on PATH) backs all of this — every skill below shells out to it for state (`openspec status --change "<name>" --json`, `openspec instructions <artifact> --change "<name>" --json`, `openspec list --json`).

A change moves through these artifacts, in dependency order: **proposal.md** (what & why) → **design.md** (how) → **tasks.md** (implementation steps) → optional delta specs under `specs/<capability>/`. Once `tasks.md` exists, implementation can begin; tasks are checked off (`- [ ]` → `- [x]`) as they're completed.

Slash commands (`/opsx:*`) map 1:1 to skills in `.claude/skills/`:

| Command | Skill | Purpose |
|---|---|---|
| `/opsx:propose` | `openspec-propose` | Create a change and generate proposal/design/tasks in one pass |
| `/opsx:explore` | `openspec-explore` | Thinking-partner mode — investigate/clarify, never implement |
| `/opsx:apply` | `openspec-apply-change` | Work through `tasks.md` for a change, implementing one task at a time |
| `/opsx:sync` | `openspec-sync-specs` | Merge a change's delta specs into `openspec/specs/<capability>/spec.md` |
| `/opsx:archive` | `openspec-archive-change` | Move a finished change into `openspec/changes/archive/YYYY-MM-DD-<name>/` |

Key conventions when operating in this workflow:
- Active changes live under `openspec/changes/<name>/`; completed ones are moved (not copied) to `openspec/changes/archive/`.
- Main specs (the source of truth for capabilities) live at `openspec/specs/<capability>/spec.md`; changes propose *delta* specs that get intelligently merged in via sync, not wholesale-replaced.
- `context` and `rules` returned by `openspec instructions` are constraints for the agent producing an artifact — never copy them into the artifact file itself.
- Explore mode (`/opsx:explore`) is strictly read-only for code; it may create/update OpenSpec artifacts but must never write application code.
