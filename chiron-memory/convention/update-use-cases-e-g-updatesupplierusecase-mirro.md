---
id: f8fc8496-740c-4b7a-b482-5172b7d9713e-1
type: convention
title: Update use cases (e.g
tags: [convention]
created: 2026-07-30
resource: src/application/use-cases/<aggregate>/Update<Aggregate>UseCase.ts.
---
Update use cases (e.g. UpdateSupplierUseCase, mirroring UpdateProductUseCase) apply changes by calling domain entity mutator methods (`updateName()`, `updateContactInfo()`, etc.) rather than reconstructing/overwriting the entity.

## Why
Keeps validation invariants (e.g. name length, email format) enforced inside the entity, not duplicated in the use case.

## Learned
Follow this pattern for any future Update*UseCase to stay consistent and avoid bypassing domain invariants.

## Where
src/application/use-cases/<aggregate>/Update<Aggregate>UseCase.ts.
