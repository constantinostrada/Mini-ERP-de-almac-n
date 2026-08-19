---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-0
type: gotcha
title: Importing from the bare `@/application` barrel fails type-checking.
tags: [gotcha]
created: 2026-08-19
resource: tsconfig.json `paths`, src/application/index.ts.
---
Importing from the bare `@/application` barrel fails type-checking.

## Why
tsconfig.json only defines wildcarded path aliases (`@/application/*`, `@/domain/*`, etc.), not a bare-specifier alias to the barrel's index.

## Learned
import DTOs/mappers/use-cases directly from their module path (e.g. `@/application/dtos/ProductDTO`) instead of the `@/application` barrel.

## Where
tsconfig.json `paths`, src/application/index.ts.
