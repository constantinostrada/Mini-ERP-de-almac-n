---
id: e967d98e-e2d8-495b-9456-60658761f318-1
type: convention
title: The CSV escaping helper quotes any field containing a comma, double quote, or line break,…
tags: [convention]
created: 2026-08-20
resource: src/interfaces/api/helpers/csv.ts
---
The CSV escaping helper quotes any field containing a comma, double quote, or line break, doubling embedded quotes (standard RFC 4180 escaping).

## Learned
needed explicitly for product names like `Tornillo "inox", 5mm` — covered by an integration test asserting correct escaping.

## Where
src/interfaces/api/helpers/csv.ts
