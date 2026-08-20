---
id: e967d98e-e2d8-495b-9456-60658761f318-13
type: convention
title: New domain entities/services and application DTOs/use-cases must be manually re-exported…
tags: [convention]
created: 2026-08-20
resource: src/domain/index.ts, src/application/index.ts.
---
New domain entities/services and application DTOs/use-cases must be manually re-exported from `src/domain/index.ts` and `src/application/index.ts` respectively — nothing is auto-discovered.

## Why
Other layers (container wiring, routes, UI) import via these barrels, so a forgotten export means the new code is unreachable outside its own file despite compiling fine.

## Where
src/domain/index.ts, src/application/index.ts.
