---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-5
type: gotcha
title: `npm run lint` (`next lint`) is broken repository-wide because the installed Next 14.2.5…
tags: [gotcha]
created: 2026-07-30
---
`npm run lint` (`next lint`) is broken repository-wide because the installed Next 14.2.5 rejects the project's `next.config.ts` file.

## Why
pre-existing repo issue, unrelated to any specific feature change.

## Learned
Don't treat lint failures as caused by your change — verify with `git stash` first; rely on `npm run type-check` and `npm test` instead.
