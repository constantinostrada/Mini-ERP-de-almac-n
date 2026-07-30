---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-7
type: convention
title: New use cases and DTOs must be re-exported from the `src/application/index.ts` barrel…
tags: [convention]
created: 2026-07-30
resource: src/application/index.ts.
---
New use cases and DTOs must be re-exported from the `src/application/index.ts` barrel file (not just created in their own module).

## Learned
Following the Product pattern, the Supplier CRUD use cases and the new GetSupplierByIdDTO were added as exports here so consumers (Container.ts, route handlers) can import from the barrel.

## Where
src/application/index.ts.
