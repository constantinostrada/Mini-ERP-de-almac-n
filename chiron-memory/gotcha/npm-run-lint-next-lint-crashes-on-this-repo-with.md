---
id: e967d98e-e2d8-495b-9456-60658761f318-4
type: gotcha
title: `npm run lint` (`next lint`) crashes on this repo with an error thrown from…
tags: [gotcha]
created: 2026-08-20
---
`npm run lint` (`next lint`) crashes on this repo with an error thrown from `next.config.ts`, because that config format is unsupported by the Next 14 version installed here; this is pre-existing and unrelated to any feature work.

## Learned
run `npx eslint <changed files>` directly instead of the `lint` script to validate changes.
