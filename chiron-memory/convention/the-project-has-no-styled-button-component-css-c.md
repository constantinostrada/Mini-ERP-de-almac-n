---
id: e967d98e-e2d8-495b-9456-60658761f318-5
type: convention
title: The project has no styled button component/CSS class
tags: [convention]
created: 2026-08-20
resource: src/app/products/page.tsx (Export CSV button), src/app/globals.css (no `.button`/`button` rules defined)
---
The project has no styled button component/CSS class — plain unstyled `<button>` elements are used for UI actions, and a button must not be nested inside an `<a>` (invalid HTML); use an onClick handler to navigate instead.

## Where
src/app/products/page.tsx (Export CSV button), src/app/globals.css (no `.button`/`button` rules defined)
