---
id: e967d98e-e2d8-495b-9456-60658761f318-10
type: architecture
title: `GetSupplierValuationUseCase` (application layer) is injected with both…
tags: [architecture]
created: 2026-08-20
resource: src/application/use-cases/valuation/GetSupplierValuationUseCase.ts, src/app/api/suppliers/valuation/route.ts, src/app/suppliers/page.tsx.
---
`GetSupplierValuationUseCase` (application layer) is injected with both `ISupplierRepository` and `IProductRepository`, fetches both, and delegates the actual calculation to the domain's `StockValuationService` — the use case itself does no math, and the API route/controller does no business logic either.

## Why
Preserves the project's layering rule that business logic lives only in domain/application, never in controllers or UI.

## Where
src/application/use-cases/valuation/GetSupplierValuationUseCase.ts, src/app/api/suppliers/valuation/route.ts, src/app/suppliers/page.tsx.
