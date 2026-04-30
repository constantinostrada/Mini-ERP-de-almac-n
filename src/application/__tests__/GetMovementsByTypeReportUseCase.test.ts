import { Product } from '@/domain/entities/Product';
import { StockMovement, type MovementType } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { GetMovementsByTypeReportUseCase } from '../use-cases/stock/GetMovementsByTypeReportUseCase';

function seedProduct(
  repo: InMemoryProductRepository,
  id: string,
  sku: string,
  name: string,
): void {
  const product = Product.create({
    id: ProductId.create(id),
    sku: SKU.create(sku),
    name,
    description: '',
    unitPrice: Money.fromDecimal(10, 'EUR'),
    stockQuantity: Quantity.create(100),
    reorderThreshold: Quantity.create(0),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  repo.seed([product]);
}

async function seedMovement(
  repo: InMemoryStockMovementRepository,
  id: string,
  productId: string,
  type: MovementType,
  quantity: number,
  occurredAt: Date,
): Promise<void> {
  const movement = StockMovement.create({
    id,
    productId: ProductId.create(productId),
    type,
    quantity: Quantity.create(quantity),
    occurredAt,
  });
  await repo.save(movement);
}

describe('GetMovementsByTypeReportUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let useCase: GetMovementsByTypeReportUseCase;
  const NOW = new Date('2026-04-30T12:00:00.000Z');

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    useCase = new GetMovementsByTypeReportUseCase(movementRepo, productRepo);
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns INGRESO movements within the window with sku, product_name and occurred_at', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');
    seedProduct(productRepo, 'p2', 'SKU-2', 'Producto Dos');

    await seedMovement(
      movementRepo,
      'm1',
      'p1',
      'INBOUND',
      5,
      new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'm2',
      'p2',
      'INBOUND',
      8,
      new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    );

    const result = await useCase.execute({ type: 'INGRESO', days: 7 });

    expect(result).toEqual([
      {
        sku: 'SKU-1',
        product_name: 'Producto Uno',
        type: 'INGRESO',
        quantity: 5,
        occurred_at: new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        sku: 'SKU-2',
        product_name: 'Producto Dos',
        type: 'INGRESO',
        quantity: 8,
        occurred_at: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  });

  it('filters out movements of the opposite type', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');

    await seedMovement(
      movementRepo,
      'm-in',
      'p1',
      'INBOUND',
      3,
      new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'm-out',
      'p1',
      'OUTBOUND',
      4,
      new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000),
    );

    const ingresos = await useCase.execute({ type: 'INGRESO', days: 7 });
    expect(ingresos).toHaveLength(1);
    expect(ingresos[0]?.quantity).toBe(3);

    const egresos = await useCase.execute({ type: 'EGRESO', days: 7 });
    expect(egresos).toHaveLength(1);
    expect(egresos[0]?.quantity).toBe(4);
    expect(egresos[0]?.type).toBe('EGRESO');
  });

  it('excludes movements older than the days window', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');

    await seedMovement(
      movementRepo,
      'recent',
      'p1',
      'INBOUND',
      1,
      new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'old',
      'p1',
      'INBOUND',
      2,
      new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    );

    const result = await useCase.execute({ type: 'INGRESO', days: 7 });
    expect(result).toHaveLength(1);
    expect(result[0]?.quantity).toBe(1);
  });

  it('orders results by occurred_at descending', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');

    await seedMovement(
      movementRepo,
      'oldest',
      'p1',
      'INBOUND',
      1,
      new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'newest',
      'p1',
      'INBOUND',
      3,
      new Date(NOW.getTime() - 1 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'middle',
      'p1',
      'INBOUND',
      2,
      new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    );

    const result = await useCase.execute({ type: 'INGRESO', days: 30 });
    expect(result.map((r) => r.quantity)).toEqual([3, 2, 1]);
  });

  it('drops rows whose product no longer exists', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');

    await seedMovement(
      movementRepo,
      'm1',
      'p1',
      'INBOUND',
      1,
      new Date(NOW.getTime() - 1 * 60 * 60 * 1000),
    );
    await seedMovement(
      movementRepo,
      'orphan',
      'deleted-product',
      'INBOUND',
      9,
      new Date(NOW.getTime() - 1 * 60 * 60 * 1000),
    );

    const result = await useCase.execute({ type: 'INGRESO', days: 7 });
    expect(result).toHaveLength(1);
    expect(result[0]?.sku).toBe('SKU-1');
  });

  it('returns an empty array when no movements match', async () => {
    seedProduct(productRepo, 'p1', 'SKU-1', 'Producto Uno');

    await seedMovement(
      movementRepo,
      'm-out',
      'p1',
      'OUTBOUND',
      4,
      new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000),
    );

    const result = await useCase.execute({ type: 'INGRESO', days: 7 });
    expect(result).toEqual([]);
  });

  it('rejects invalid type', async () => {
    await expect(
      useCase.execute({ type: 'BOGUS' as 'INGRESO', days: 7 }),
    ).rejects.toThrow(/Invalid type/);
  });

  it('rejects non-positive or non-integer days', async () => {
    await expect(useCase.execute({ type: 'INGRESO', days: 0 })).rejects.toThrow(
      /days must be a positive integer/,
    );
    await expect(useCase.execute({ type: 'INGRESO', days: -3 })).rejects.toThrow(
      /days must be a positive integer/,
    );
    await expect(useCase.execute({ type: 'INGRESO', days: 1.5 })).rejects.toThrow(
      /days must be a positive integer/,
    );
  });
});
