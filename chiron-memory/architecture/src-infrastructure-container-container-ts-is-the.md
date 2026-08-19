---
id: eccab277-e9a1-4023-b2f7-1b6df94bb729-7
type: architecture
title: `src/infrastructure/container/Container.ts` is the single composition root
tags: [architecture]
created: 2026-08-19
resource: src/infrastructure/container/Container.ts.
---
`src/infrastructure/container/Container.ts` is the single composition root — it instantiates repositories and wires every use case to its dependencies; a use case not registered there is unreachable from any route.

## Why
keeps dependency wiring in one place instead of routes constructing use cases directly, preserving clean-architecture boundaries.

## Where
src/infrastructure/container/Container.ts.
