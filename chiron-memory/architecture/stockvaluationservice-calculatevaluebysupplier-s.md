---
id: e967d98e-e2d8-495b-9456-60658761f318-8
type: architecture
title: `StockValuationService.calculateValueBySupplier(suppliers, products, currency)` computes…
tags: [architecture]
created: 2026-08-20
resource: src/domain/services/StockValuationService.ts.
---
`StockValuationService.calculateValueBySupplier(suppliers, products, currency)` computes per-supplier totals (product count, units, monetary value) by filtering products per supplier and delegating to the existing `calculateWarehouseValue` method rather than duplicating the money-summing logic.

## Why
Keeps all valuation math in the single domain service it already lived in.

## Where
src/domain/services/StockValuationService.ts.
