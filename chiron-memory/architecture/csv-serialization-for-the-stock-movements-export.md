---
id: e967d98e-e2d8-495b-9456-60658761f318-0
type: architecture
title: CSV serialization for the stock movements export lives in `interfaces/api/helpers/csv.ts`…
tags: [architecture]
created: 2026-08-20
resource: src/interfaces/api/helpers/csv.ts, src/application/use-cases/stock/GetStockMovementsExportUseCase.ts, src/app/api/movements/export/route.ts
---
CSV serialization for the stock movements export lives in `interfaces/api/helpers/csv.ts` (an RFC 4180-style `toCsv()` helper), while the application-layer `GetStockMovementsExportUseCase` returns plain `StockMovementExportRowDTO[]` rows with no string formatting.

## Why
keeps the application layer storage/format-agnostic — the use case is reusable regardless of output format, and the interfaces layer owns HTTP-specific concerns like CSV/Content-Disposition.

## Where
src/interfaces/api/helpers/csv.ts, src/application/use-cases/stock/GetStockMovementsExportUseCase.ts, src/app/api/movements/export/route.ts
