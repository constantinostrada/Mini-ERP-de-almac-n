---
id: e967d98e-e2d8-495b-9456-60658761f318-7
type: gotcha
title: `Product.supplierId` has no referential-integrity validation against `ISupplierRepository`
tags: [gotcha]
created: 2026-08-20
---
`Product.supplierId` has no referential-integrity validation against `ISupplierRepository` — a product can be created with a `supplierId` that matches no existing supplier.

## Why
Kept CreateProductUseCase simple; such orphaned products are silently excluded from the per-supplier valuation grouping rather than erroring.

## Learned
If a future feature needs strict supplier linkage, add a check in CreateProductUseCase or the domain layer — it doesn't exist today.
