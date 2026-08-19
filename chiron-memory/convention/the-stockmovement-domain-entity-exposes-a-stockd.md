---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-4
type: convention
title: The StockMovement domain entity exposes a `stockDelta` getter (inbound/adjustment =…
tags: [convention]
created: 2026-08-19
resource: src/domain/entities/StockMovement.ts.
---
The StockMovement domain entity exposes a `stockDelta` getter (inbound/adjustment = +quantity, outbound = -quantity).

## Why
keeps the business rule of how each movement type affects stock inside the domain entity rather than duplicating it in application-layer use cases.

## Where
src/domain/entities/StockMovement.ts.
