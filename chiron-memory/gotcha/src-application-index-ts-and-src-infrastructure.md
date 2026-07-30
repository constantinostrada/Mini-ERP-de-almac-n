---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-6
type: gotcha
title: `src/application/index.ts` and `src/infrastructure/container/Container.ts` already fail…
tags: [gotcha]
created: 2026-07-30
---
`src/application/index.ts` and `src/infrastructure/container/Container.ts` already fail `prettier --check` on the main branch before any changes.

## Why
pre-existing formatting drift, confirmed via `git stash` comparison.

## Learned
Don't attribute prettier warnings in these two files to your own edits; they're out of scope to fix incidentally.
