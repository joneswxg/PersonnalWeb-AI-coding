# Domain Docs

How engineering skills consume this repository's domain documentation.

## Before exploration

Read root `CONTEXT.md` and ADRs in `docs/adr/` that apply to the area of work. If either is absent or contains no relevant material, continue without comment.

## Layout

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

## Vocabulary and decisions

Use terms defined in `CONTEXT.md` in issues, specifications, tests, and proposals. Surface an applicable ADR conflict explicitly rather than silently overriding it. Use `/domain-modeling` to add a missing domain term or record a hard-to-reverse decision when it is resolved.
