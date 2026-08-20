---
id: e967d98e-e2d8-495b-9456-60658761f318-9
type: convention
title: New static API route segments are added as siblings of dynamic `[id]` routes under the…
tags: [convention]
created: 2026-08-20
resource: src/app/api/suppliers/valuation/route.ts, src/app/api/products/ (low-stock).
---
New static API route segments are added as siblings of dynamic `[id]` routes under the same resource (e.g. `/api/suppliers/valuation` next to `/api/suppliers/[id]`), following the existing precedent of `/api/products/low-stock`.

## Why
Next.js route resolution allows static and dynamic segments to coexist at the same level without conflict, and the codebase already used this pattern for products.

## Where
src/app/api/suppliers/valuation/route.ts, src/app/api/products/ (low-stock).
