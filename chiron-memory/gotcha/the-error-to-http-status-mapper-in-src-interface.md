---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-0
type: gotcha
title: The error-to-HTTP-status mapper in `src/interfaces/api/helpers/apiResponse.ts` requires…
tags: [gotcha]
created: 2026-07-30
resource: src/interfaces/api/helpers/apiResponse.ts.
---
The error-to-HTTP-status mapper in `src/interfaces/api/helpers/apiResponse.ts` requires each aggregate's `*NotFoundException` to be explicitly mapped to 404.

## Why
Unmapped NotFoundException subclasses fall through to the generic `DomainException` branch and return 400 instead of 404, breaking parity with existing aggregates (e.g. Product).

## Learned
When adding CRUD for a new aggregate, always add its NotFoundException to this mapper or GET/PUT/DELETE-by-id will return the wrong status code.

## Where
src/interfaces/api/helpers/apiResponse.ts.
