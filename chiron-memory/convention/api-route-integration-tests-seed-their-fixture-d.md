---
id: e967d98e-e2d8-495b-9456-60658761f318-14
type: convention
title: API route integration tests seed their fixture data by calling the real POST route…
tags: [convention]
created: 2026-08-20
resource: src/app/api/suppliers/valuation/__tests__/suppliers-valuation.route.integration.test.ts.
---
API route integration tests seed their fixture data by calling the real POST route handlers (e.g. creating suppliers and products through their actual endpoints) rather than writing directly into the in-memory repositories.

## Why
Exercises the same request/validation/mapping path production traffic uses, catching wiring bugs that direct repo seeding would miss.

## Where
src/app/api/suppliers/valuation/__tests__/suppliers-valuation.route.integration.test.ts.
