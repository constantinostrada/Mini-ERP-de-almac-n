import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { POST as createProductHandler } from '../../products/route';
import { POST as registerMovementHandler } from '../../movements/route';
import { GET as reportHandler } from '../movements-by-type/route';

const productRepo = container.productRepository as InMemoryProductRepository;
const movementRepo = container.stockMovementRepository as InMemoryStockMovementRepository;

function jsonRequest(url: string, method: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function readJson(res: Response): Promise<{
  status: number;
  body: { success: boolean; data?: unknown; error?: { code: string; message: string } };
}> {
  return { status: res.status, body: await res.json() };
}

const productPayload: CreateProductDTO = {
  sku: 'RPT-001',
  name: 'Producto reporte',
  description: 'Para tests del reporte',
  unitPriceAmount: 9.99,
  unitPriceCurrency: 'EUR',
  initialStockQuantity: 100,
  reorderThreshold: 5,
};

async function createProduct(payload: CreateProductDTO = productPayload): Promise<string> {
  const res = await createProductHandler(
    jsonRequest('http://localhost/api/products', 'POST', payload),
  );
  const { body } = await readJson(res);
  return (body.data as { id: string }).id;
}

async function registerMovement(
  productId: string,
  type: 'INGRESO' | 'EGRESO',
  quantity: number,
): Promise<void> {
  await registerMovementHandler(
    jsonRequest('http://localhost/api/movements', 'POST', {
      product_id: productId,
      type,
      quantity,
    }),
  );
}

describe('Integration — /api/reports/movements-by-type', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
  });

  it('returns INGRESO movements with sku, product_name, type, quantity, occurred_at', async () => {
    const productId = await createProduct();
    await registerMovement(productId, 'INGRESO', 7);
    await registerMovement(productId, 'EGRESO', 3);

    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=INGRESO&days=7',
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);

    const data = body.data as Array<{
      sku: string;
      product_name: string;
      type: string;
      quantity: number;
      occurred_at: string;
    }>;
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      sku: 'RPT-001',
      product_name: 'Producto reporte',
      type: 'INGRESO',
      quantity: 7,
      occurred_at: expect.any(String),
    });
    expect(() => new Date(data[0]!.occurred_at).toISOString()).not.toThrow();
  });

  it('filters EGRESO movements and excludes INGRESO ones', async () => {
    const productId = await createProduct();
    await registerMovement(productId, 'INGRESO', 7);
    await registerMovement(productId, 'EGRESO', 4);
    await registerMovement(productId, 'EGRESO', 2);

    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=EGRESO&days=30',
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    const data = body.data as Array<{ type: string; quantity: number }>;
    expect(data).toHaveLength(2);
    for (const row of data) {
      expect(row.type).toBe('EGRESO');
    }
    expect(data.map((d) => d.quantity).sort()).toEqual([2, 4]);
  });

  it('orders results by occurred_at descending', async () => {
    const productId = await createProduct();
    await registerMovement(productId, 'INGRESO', 1);
    await new Promise((r) => setTimeout(r, 5));
    await registerMovement(productId, 'INGRESO', 2);
    await new Promise((r) => setTimeout(r, 5));
    await registerMovement(productId, 'INGRESO', 3);

    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=INGRESO&days=7',
        { method: 'GET' },
      ),
    );
    const { body } = await readJson(res);
    const data = body.data as Array<{ quantity: number; occurred_at: string }>;
    expect(data.map((d) => d.quantity)).toEqual([3, 2, 1]);

    const times = data.map((d) => new Date(d.occurred_at).getTime());
    for (let i = 0; i < times.length - 1; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i + 1] as number);
    }
  });

  it('joins each movement with its own product (sku and name)', async () => {
    const idA = await createProduct({
      ...productPayload,
      sku: 'RPT-A',
      name: 'Alpha',
    });
    const idB = await createProduct({
      ...productPayload,
      sku: 'RPT-B',
      name: 'Beta',
    });

    await registerMovement(idA, 'INGRESO', 1);
    await registerMovement(idB, 'INGRESO', 2);

    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=INGRESO&days=7',
        { method: 'GET' },
      ),
    );
    const { body } = await readJson(res);
    const data = body.data as Array<{ sku: string; product_name: string; quantity: number }>;
    expect(data).toHaveLength(2);

    const byQty = new Map(data.map((d) => [d.quantity, d]));
    expect(byQty.get(1)).toEqual({
      sku: 'RPT-A',
      product_name: 'Alpha',
      type: 'INGRESO',
      quantity: 1,
      occurred_at: expect.any(String),
    });
    expect(byQty.get(2)).toEqual({
      sku: 'RPT-B',
      product_name: 'Beta',
      type: 'INGRESO',
      quantity: 2,
      occurred_at: expect.any(String),
    });
  });

  it('returns 400-class error when type is missing', async () => {
    const res = await reportHandler(
      new NextRequest('http://localhost/api/reports/movements-by-type?days=7', {
        method: 'GET',
      }),
    );
    const { status, body } = await readJson(res);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
    expect(body.error?.message).toMatch(/type/);
  });

  it('returns 400-class error when days is missing', async () => {
    const res = await reportHandler(
      new NextRequest('http://localhost/api/reports/movements-by-type?type=INGRESO', {
        method: 'GET',
      }),
    );
    const { status, body } = await readJson(res);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
    expect(body.error?.message).toMatch(/days/);
  });

  it('returns 400-class error when type is not INGRESO/EGRESO', async () => {
    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=BOGUS&days=7',
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
    expect(body.error?.message).toMatch(/Invalid type/);
  });

  it('returns 400-class error when days is not a positive integer', async () => {
    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=INGRESO&days=0',
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.success).toBe(false);
    expect(body.error?.message).toMatch(/days/);
  });

  it('returns an empty array when no movements match the filter', async () => {
    await createProduct();

    const res = await reportHandler(
      new NextRequest(
        'http://localhost/api/reports/movements-by-type?type=INGRESO&days=7',
        { method: 'GET' },
      ),
    );
    const { status, body } = await readJson(res);
    expect(status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
