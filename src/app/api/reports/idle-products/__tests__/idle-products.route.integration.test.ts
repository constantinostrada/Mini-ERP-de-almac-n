import { NextRequest } from 'next/server';

import { Product } from '@/domain/entities/Product';
import { StockMovement } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';

import { container } from '@/infrastructure/container/Container';

import { GET as idleProductsHandler } from '../route';

const MS_PER_DAY = 86_400_000;

const productRepo = container.productRepository;
const movementRepo = container.stockMovementRepository;

function seedProduct(id: string, sku: string, name: string, stock: number): void {
  productRepo.seed([
    Product.create({
      id: ProductId.create(id),
      sku: SKU.create(sku),
      name,
      description: '',
      unitPrice: Money.fromDecimal(10, 'EUR'),
      stockQuantity: Quantity.create(stock),
      reorderThreshold: Quantity.create(0),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);
}

async function seedMovement(productId: string, daysAgo: number, movementId: string): Promise<void> {
  await movementRepo.save(
    StockMovement.create({
      id: movementId,
      productId: ProductId.create(productId),
      type: 'INBOUND',
      quantity: Quantity.create(1),
      occurredAt: new Date(Date.now() - daysAgo * MS_PER_DAY),
    }),
  );
}

async function readJson(res: Response): Promise<{
  status: number;
  body: { success: boolean; data?: unknown; error?: { code: string; message: string } };
}> {
  return { status: res.status, body: await res.json() };
}

interface IdleRow {
  sku: string;
  name: string;
  current_stock: number;
  last_movement_at: string | null;
  days_since_last_movement: number | null;
}

describe('Integration — GET /api/reports/idle-products', () => {
  const days = 30;

  beforeEach(async () => {
    productRepo.clear();
    movementRepo.clear();

    // 4 productos en distinto estado.
    seedProduct('p-today', 'SKU-TODAY', 'Movido hoy', 100);
    await seedMovement('p-today', 0, 'mov-today');

    seedProduct('p-old', 'SKU-OLD', 'Movido hace mucho', 50);
    await seedMovement('p-old', days + 1, 'mov-old');

    seedProduct('p-never', 'SKU-NEVER', 'Nunca movido', 7);

    seedProduct('p-within', 'SKU-WITHIN', 'Movido en rango', 25);
    await seedMovement('p-within', 5, 'mov-within');
  });

  it('returns only products older than N days, excluding never-moved by default', async () => {
    const res = await idleProductsHandler(
      new NextRequest(`http://localhost/api/reports/idle-products?days=${days}`, {
        method: 'GET',
      }),
    );
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);

    const data = body.data as IdleRow[];
    expect(data).toHaveLength(1);
    expect(data[0]?.sku).toBe('SKU-OLD');
    expect(data[0]?.current_stock).toBe(50);
    expect(data[0]?.days_since_last_movement).toBe(days + 1);
    expect(typeof data[0]?.last_movement_at).toBe('string');
  });

  it('includes never-moved products with null fields when include_never_moved=true', async () => {
    const res = await idleProductsHandler(
      new NextRequest(
        `http://localhost/api/reports/idle-products?days=${days}&include_never_moved=true`,
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    const data = body.data as IdleRow[];
    expect(data).toHaveLength(2);

    const skus = data.map((d) => d.sku);
    expect(skus).toContain('SKU-OLD');
    expect(skus).toContain('SKU-NEVER');

    const never = data.find((d) => d.sku === 'SKU-NEVER');
    expect(never?.last_movement_at).toBeNull();
    expect(never?.days_since_last_movement).toBeNull();
    expect(never?.current_stock).toBe(7);
  });

  it('returns 400/500-class error when days param is missing', async () => {
    const res = await idleProductsHandler(
      new NextRequest('http://localhost/api/reports/idle-products', { method: 'GET' }),
    );
    const { status, body } = await readJson(res);

    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
    expect(body.error?.message).toMatch(/days/);
  });

  it('rejects non-integer days param', async () => {
    const res = await idleProductsHandler(
      new NextRequest('http://localhost/api/reports/idle-products?days=abc', {
        method: 'GET',
      }),
    );
    const { status, body } = await readJson(res);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
  });

  it('orders rows by days_since_last_movement descending (never-moved first)', async () => {
    // add a yet-older product
    seedProduct('p-older', 'SKU-OLDER', 'Aún más viejo', 1);
    await seedMovement('p-older', days + 50, 'mov-older');

    const res = await idleProductsHandler(
      new NextRequest(
        `http://localhost/api/reports/idle-products?days=${days}&include_never_moved=true`,
        { method: 'GET' },
      ),
    );
    const { body } = await readJson(res);
    const data = body.data as IdleRow[];

    const skus = data.map((d) => d.sku);
    expect(skus[0]).toBe('SKU-NEVER');
    expect(skus.indexOf('SKU-OLDER')).toBeLessThan(skus.indexOf('SKU-OLD'));
  });
});
