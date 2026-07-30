---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-3
type: convention
title: Use-case unit tests use a `FixedIdGenerator` plus an in-memory repository implementation…
tags: [convention]
created: 2026-07-30
resource: src/application/__tests__/*.test.ts, src/infrastructure/repositories/InMemory*Repository.ts.
---
Use-case unit tests use a `FixedIdGenerator` plus an in-memory repository implementation instead of mocking frameworks.

## Where
src/application/__tests__/*.test.ts, src/infrastructure/repositories/InMemory*Repository.ts.
