---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-4
type: architecture
title: Full CRUD lifecycle for an aggregate is built as
tags: [architecture]
created: 2026-07-30
resource: established first for Product, replicated for Supplier in this task.
---
Full CRUD lifecycle for an aggregate is built as: one use case per operation (Get/Update/Delete) constructor-injected with the aggregate's repository port, DTOs + a Mapper to convert entity<->DTO, wired into `src/infrastructure/container/Container.ts`, exposed via a thin `src/app/api/<aggregate>/[id]/route.ts` handler that calls `parseBody`/`successResponse`/`handleError`.

## Where
established first for Product, replicated for Supplier in this task.
