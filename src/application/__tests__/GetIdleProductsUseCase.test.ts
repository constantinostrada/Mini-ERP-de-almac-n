import { Product } from '@/domain/entities/Product';
import { StockMovement } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';

import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { GetIdleProductsUseCase } from '../use-cases/reports/GetIdleProductsUseCase';

const MS_PER_DAY = 86_400_000;

function seedProduct(
  repo: InMemoryProductRepository,
  id: string,
  sku: string,
  name: string,
  stock: number,
): Product {
  const product = Product.create({
    id: ProductId.create(id),
    sku: SKU.create(sku),
    name,
    description: '',
    unitPrice: Money.fromDecimal(10, 'EUR'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(0),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  repo.seed([product]);
  return product;
}

async function seedMovement(
  repo: InMemoryStockMovementRepository,
  productId: string,
  daysAgo: number,
  movementId: string,
): Promise<void> {
  const occurredAt = new Date(Date.now() - daysAgo * MS_PER_DAY);
  const movement = StockMovement.create({
    id: movementId,
    productId: ProductId.create(productId),
    type: 'INBOUND',
    quantity: Quantity.create(1),
    occurredAt,
  });
  await repo.save(movement);
}

describe('GetIdleProductsUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let useCase: GetIdleProductsUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    useCase = new GetIdleProductsUseCase(productRepo, movementRepo);
  });

  describe('with 4 products in different states (days=30)', () => {
    const days = 30;

    beforeEach(async () => {
      // moved hoy (today)
      seedProduct(productRepo, 'p-today', 'SKU-TODAY', 'Movido hoy', 100);
      await seedMovement(movementRepo, 'p-today', 0, 'mov-today');

      // moved hace days+1 días → idle
      seedProduct(productRepo, 'p-old', 'SKU-OLD', 'Movido hace mucho', 50);
      await seedMovement(movementRepo, 'p-old', days + 1, 'mov-old');

      // nunca movido
      seedProduct(productRepo, 'p-never', 'SKU-NEVER', 'Nunca movido', 7);

      // movido dentro del rango (5 días atrás)
      seedProduct(productRepo, 'p-within', 'SKU-WITHIN', 'Movido en rango', 25);
      await seedMovement(movementRepo, 'p-within', 5, 'mov-within');
    });

    it('returns only the product moved more than N days ago when include_never_moved is false', async () => {
      const result = await useCase.execute({ days, includeNeverMoved: false });

      expect(result).toHaveLength(1);
      expect(result[0]?.sku).toBe('SKU-OLD');
      expect(result[0]?.name).toBe('Movido hace mucho');
      expect(result[0]?.current_stock).toBe(50);
      expect(result[0]?.days_since_last_movement).toBe(days + 1);
      expect(typeof result[0]?.last_movement_at).toBe('string');
    });

    it('includes never-moved products with null fields when include_never_moved is true', async () => {
      const result = await useCase.execute({ days, includeNeverMoved: true });

      expect(result).toHaveLength(2);

      const skus = result.map((r) => r.sku);
      expect(skus).toContain('SKU-OLD');
      expect(skus).toContain('SKU-NEVER');
      expect(skus).not.toContain('SKU-TODAY');
      expect(skus).not.toContain('SKU-WITHIN');

      const never = result.find((r) => r.sku === 'SKU-NEVER');
      expect(never?.last_movement_at).toBeNull();
      expect(never?.days_since_last_movement).toBeNull();
      expect(never?.current_stock).toBe(7);
    });

    it('sorts by days_since_last_movement descending (most idle first; never-moved on top)', async () => {
      // Add a second old product to verify ordering between two non-null entries.
      seedProduct(productRepo, 'p-older', 'SKU-OLDER', 'Aún más viejo', 1);
      await seedMovement(movementRepo, 'p-older', days + 50, 'mov-older');

      const result = await useCase.execute({ days, includeNeverMoved: true });

      const skus = result.map((r) => r.sku);
      // never-moved is "infinitely idle" → first
      expect(skus[0]).toBe('SKU-NEVER');
      // SKU-OLDER (days+50) comes before SKU-OLD (days+1)
      expect(skus.indexOf('SKU-OLDER')).toBeLessThan(skus.indexOf('SKU-OLD'));
    });

    it('omits never-moved products by default (include_never_moved not provided)', async () => {
      const result = await useCase.execute({ days });

      const skus = result.map((r) => r.sku);
      expect(skus).not.toContain('SKU-NEVER');
    });
  });

  it('rejects negative days', async () => {
    await expect(useCase.execute({ days: -1 })).rejects.toThrow(/days/);
  });

  it('returns empty array when no products are registered', async () => {
    const result = await useCase.execute({ days: 30, includeNeverMoved: true });
    expect(result).toEqual([]);
  });
});
