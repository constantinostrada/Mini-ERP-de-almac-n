---
id: e967d98e-e2d8-495b-9456-60658761f318-6
type: decision
title: Added an optional `supplierId?
tags: [decision]
created: 2026-08-20
resource: src/domain/entities/Product.ts, src/application/dtos/ProductDTO.ts, src/application/use-cases/product/CreateProductUseCase.ts, src/application/mappers/ProductMapper.ts.
---
Added an optional `supplierId?: string` field to the `Product` domain entity (plus DTO/mapper/create-use-case plumbing) because no Product→Supplier relationship existed anywhere in the codebase.

## Why
The 'valuación de inventario por proveedor' task requires grouping products by supplier, which was impossible without this link; a plain string was used (not a value object) to match `Supplier.id`, which is also a plain string.

## Where
src/domain/entities/Product.ts, src/application/dtos/ProductDTO.ts, src/application/use-cases/product/CreateProductUseCase.ts, src/application/mappers/ProductMapper.ts.
