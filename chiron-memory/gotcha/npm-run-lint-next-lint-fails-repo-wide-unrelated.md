---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-1
type: gotcha
title: `npm run lint` (next lint) fails repo-wide, unrelated to any code change.
tags: [gotcha]
created: 2026-08-19
resource: next.config.ts, package.json `lint` script.
---
`npm run lint` (next lint) fails repo-wide, unrelated to any code change.

## Why
the installed Next 14.2.5 doesn't support the repo's `next.config.ts` (TS config file) and throws before linting anything.

## Learned
lint changed files directly with `npx eslint <files>` instead of relying on `npm run lint`.

## Where
next.config.ts, package.json `lint` script.
