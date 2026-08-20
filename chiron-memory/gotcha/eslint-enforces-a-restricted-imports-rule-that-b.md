---
id: e967d98e-e2d8-495b-9456-60658761f318-11
type: gotcha
title: ESLint enforces a restricted-imports rule that blocks application-layer test files from…
tags: [gotcha]
created: 2026-08-20
---
ESLint enforces a restricted-imports rule that blocks application-layer test files from importing infrastructure-layer modules (e.g. `@/infrastructure/repositories/InMemoryProductRepository`) directly by that path.

## Why
Surfaced as a lint error while writing `GetSupplierValuationUseCase.test.ts`; the fix was to adjust the import path/grouping rather than disable the rule.

## Learned
When writing application-layer unit tests that need in-memory repos, check how existing tests in that layer import them instead of reaching into `@/infrastructure/...` directly.
