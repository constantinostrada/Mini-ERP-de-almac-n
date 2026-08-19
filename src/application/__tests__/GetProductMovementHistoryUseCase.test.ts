import { Product } from '@/domain/entities/Product';
import { StockMovement, type MovementType } from '@/domain/entities/StockMovement';
import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { GetProductMovementHistoryUseCase } from '../use-cases/stock/GetProductMovementHistoryUseCase';

const PRODUCT_ID = 'prod-abc';

function makeProductInRepo(repo: InMemoryProductRepository, stock: number): void {
  const product = Product.create({
    id: ProductId.create(PRODUCT_ID),
    sku: SKU.create('ITEM-01'),
    name: 'Item de prueba',
    description: '',
    unitPrice: Money.fromDecimal(5, 'EUR'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  repo.seed([product]);
}

function makeMovement(
  id: string,
  type: MovementType,
  quantity: number,
  occurredAt: Date,
): StockMovement {
  return StockMovement.create({
    id,
    productId: ProductId.create(PRODUCT_ID),
    type,
    quantity: Quantity.create(quantity),
    occurredAt,
  });
}

describe('GetProductMovementHistoryUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let useCase: GetProductMovementHistoryUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    useCase = new GetProductMovementHistoryUseCase(productRepo, movementRepo);
  });

  it('throws ProductNotFoundException for an unknown product', async () => {
    await expect(useCase.execute({ productId: 'missing' })).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it('returns an empty history for a product without movements', async () => {
    makeProductInRepo(productRepo, 50);

    await expect(useCase.execute({ productId: PRODUCT_ID })).resolves.toEqual([]);
  });

  it('returns movements newest-first with the resulting stock of each one', async () => {
    // Timeline: initial stock 10 → +20 inbound (30) → -5 outbound (25) → +3 adjustment (28)
    makeProductInRepo(productRepo, 28);
    await movementRepo.save(makeMovement('m1', 'INBOUND', 20, new Date('2026-08-01T10:00:00Z')));
    await movementRepo.save(makeMovement('m2', 'OUTBOUND', 5, new Date('2026-08-02T10:00:00Z')));
    await movementRepo.save(makeMovement('m3', 'ADJUSTMENT', 3, new Date('2026-08-03T10:00:00Z')));

    const history = await useCase.execute({ productId: PRODUCT_ID });

    expect(history).toEqual([
      {
        id: 'm3',
        date: '2026-08-03T10:00:00.000Z',
        type: 'ADJUSTMENT',
        quantity: 3,
        resultingStock: 28,
      },
      {
        id: 'm2',
        date: '2026-08-02T10:00:00.000Z',
        type: 'OUTBOUND',
        quantity: 5,
        resultingStock: 25,
      },
      {
        id: 'm1',
        date: '2026-08-01T10:00:00.000Z',
        type: 'INBOUND',
        quantity: 20,
        resultingStock: 30,
      },
    ]);
  });
});
