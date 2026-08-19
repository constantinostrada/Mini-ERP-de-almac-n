---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-2
type: gotcha
title: InMemoryStockMovementRepository could return movements oldest-first when two were…
tags: [gotcha]
created: 2026-08-19
resource: src/infrastructure/repositories/InMemoryStockMovementRepository.ts.
---
InMemoryStockMovementRepository could return movements oldest-first when two were recorded within the same millisecond, breaking its documented date-descending contract.

## Why
sorting was by timestamp only with no tie-break, and Array.sort's stability preserved insertion order (oldest-first) for equal timestamps; this corrupted resulting-stock reconstruction in movement-history use cases and surfaced as a flaky integration test.

## Learned
reverse the array (or otherwise force newest-insertion-first) before the stable date sort so same-millisecond movements still resolve newest-first.

## Where
src/infrastructure/repositories/InMemoryStockMovementRepository.ts.
