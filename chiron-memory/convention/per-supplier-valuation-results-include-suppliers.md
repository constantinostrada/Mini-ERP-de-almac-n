---
id: e967d98e-e2d8-495b-9456-60658761f318-12
type: convention
title: Per-supplier valuation results include suppliers with zero products
tags: [convention]
created: 2026-08-20
resource: `GetSupplierValuationUseCase.ts` / `StockValuationService.calculateValueBySupplier`.
---
Per-supplier valuation results include suppliers with zero products — they appear in the output with productCount/unitsInStock/totalValue all zero rather than being filtered out.

## Why
Keeps the supplier list in the valuation table complete/consistent with the suppliers table, so a supplier isn't invisible just because nothing is currently linked to it.

## Where
`GetSupplierValuationUseCase.ts` / `StockValuationService.calculateValueBySupplier`.
