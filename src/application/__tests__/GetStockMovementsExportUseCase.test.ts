import { Product } from '@/domain/entities/Product';
import { StockMovement, type MovementType } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';

import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { GetStockMovementsExportUseCase } from '../use-cases/stock/GetStockMovementsExportUseCase';

function makeProduct(id: string, sku: string, name: string, stock: number): Product {
  return Product.create({
    id: ProductId.create(id),
    sku: SKU.create(sku),
    name,
    description: '',
    unitPrice: Money.fromDecimal(5, 'EUR'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeMovement(
  id: string,
  productId: string,
  type: MovementType,
  quantity: number,
  occurredAt: Date,
): StockMovement {
  return StockMovement.create({
    id,
    productId: ProductId.create(productId),
    type,
    quantity: Quantity.create(quantity),
    occurredAt,
  });
}

describe('GetStockMovementsExportUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let useCase: GetStockMovementsExportUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    useCase = new GetStockMovementsExportUseCase(productRepo, movementRepo);
  });

  it('returns an empty list when there are no movements', async () => {
    productRepo.seed([makeProduct('p1', 'SKU-01', 'Sin movimientos', 5)]);

    await expect(useCase.execute()).resolves.toEqual([]);
  });

  it('returns all movements across products newest-first with product name, SKU and resulting stock', async () => {
    // Product A: initial stock 10 → +20 inbound (30) → -5 outbound (25)
    // Product B: initial stock 0  → +8 inbound (8)
    productRepo.seed([
      makeProduct('pA', 'SKU-A', 'Producto A', 25),
      makeProduct('pB', 'SKU-B', 'Producto B', 8),
    ]);
    await movementRepo.save(makeMovement('m1', 'pA', 'INBOUND', 20, new Date('2026-08-01T10:00:00Z')));
    await movementRepo.save(makeMovement('m2', 'pB', 'INBOUND', 8, new Date('2026-08-02T10:00:00Z')));
    await movementRepo.save(makeMovement('m3', 'pA', 'OUTBOUND', 5, new Date('2026-08-03T10:00:00Z')));

    const rows = await useCase.execute();

    expect(rows).toEqual([
      {
        date: '2026-08-03T10:00:00.000Z',
        productName: 'Producto A',
        sku: 'SKU-A',
        type: 'OUTBOUND',
        quantity: 5,
        resultingStock: 25,
      },
      {
        date: '2026-08-02T10:00:00.000Z',
        productName: 'Producto B',
        sku: 'SKU-B',
        type: 'INBOUND',
        quantity: 8,
        resultingStock: 8,
      },
      {
        date: '2026-08-01T10:00:00.000Z',
        productName: 'Producto A',
        sku: 'SKU-A',
        type: 'INBOUND',
        quantity: 20,
        resultingStock: 30,
      },
    ]);
  });
});
