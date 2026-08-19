---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-3
type: decision
title: GetProductMovementHistoryUseCase computes each movement's resulting stock by walking…
tags: [decision]
created: 2026-08-19
resource: src/application/use-cases/stock/GetProductMovementHistoryUseCase.ts.
---
GetProductMovementHistoryUseCase computes each movement's resulting stock by walking backwards from the product's current stock, not forward from zero.

## Why
products can be created with a non-zero initial stock that has no corresponding stock-movement record, so forward accumulation from zero would misalign with the real resulting-stock values.

## Where
src/application/use-cases/stock/GetProductMovementHistoryUseCase.ts.
