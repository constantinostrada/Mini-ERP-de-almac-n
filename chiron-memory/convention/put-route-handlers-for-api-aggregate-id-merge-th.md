---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-2
type: convention
title: PUT route handlers for `/api/<aggregate>/[id]` merge the URL id param into the parsed…
tags: [convention]
created: 2026-07-30
resource: src/app/api/<aggregate>/[id]/route.ts (established by products, reused for suppliers).
---
PUT route handlers for `/api/<aggregate>/[id]` merge the URL id param into the parsed body before invoking the use case: `{ ...body, id: params.id }`.

## Where
src/app/api/<aggregate>/[id]/route.ts (established by products, reused for suppliers).
