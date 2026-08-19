---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-6
type: convention
title: Integration tests for API routes live in a `__tests__` subdirectory colocated under the…
tags: [convention]
created: 2026-08-19
resource: src/app/api/**/__tests__/*.integration.test.ts.
---
Integration tests for API routes live in a `__tests__` subdirectory colocated under the route's own folder (e.g. `src/app/api/products/[id]/movements/__tests__/product-movements.route.integration.test.ts`), mirroring the pattern used by `src/app/api/movements/__tests__/movements.route.integration.test.ts`.

## Why
keeps route + its integration test physically adjacent instead of a central tests folder.

## Where
src/app/api/**/__tests__/*.integration.test.ts.
