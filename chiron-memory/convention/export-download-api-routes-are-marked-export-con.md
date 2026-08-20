---
id: e967d98e-e2d8-495b-9456-60658761f318-3
type: convention
title: Export/download API routes are marked `export const dynamic = 'force-dynamic'`.
tags: [convention]
created: 2026-08-20
resource: src/app/api/movements/export/route.ts
---
Export/download API routes are marked `export const dynamic = 'force-dynamic'`.

## Why
prevents Next.js from statically caching a route that must always return the current data as a file download.

## Where
src/app/api/movements/export/route.ts
