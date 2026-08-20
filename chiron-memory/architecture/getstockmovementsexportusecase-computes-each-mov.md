---
id: e967d98e-e2d8-495b-9456-60658761f318-2
type: architecture
title: `GetStockMovementsExportUseCase` computes each movement's "resulting stock" column by…
tags: [architecture]
created: 2026-08-20
resource: src/application/use-cases/stock/GetStockMovementsExportUseCase.ts, src/application/use-cases/stock/GetProductMovementHistoryUseCase.ts
---
`GetStockMovementsExportUseCase` computes each movement's "resulting stock" column by walking backwards from the product's current stock quantity through its movement history, since `StockMovement` entities don't persist a resulting-stock snapshot.

## Why
mirrors the existing approach already used in `GetProductMovementHistoryUseCase`, so it stays correct even when a product's initial stock was non-zero.

## Where
src/application/use-cases/stock/GetStockMovementsExportUseCase.ts, src/application/use-cases/stock/GetProductMovementHistoryUseCase.ts
