import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { POST as registerMovementHandler } from '../../../../movements/route';
import { POST as createProductHandler } from '../../../route';
import { GET as productMovementsHandler } from '../route';

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
  sku: 'HIST-001',
  name: 'Producto historial',
  description: 'Para tests de historial',
  unitPriceAmount: 4.5,
  unitPriceCurrency: 'EUR',
  initialStockQuantity: 30,
  reorderThreshold: 5,
};

async function createProduct(): Promise<string> {
  const res = await createProductHandler(
    jsonRequest('http://localhost/api/products', 'POST', productPayload),
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

async function getHistory(productId: string): Promise<Response> {
  return productMovementsHandler(
    new NextRequest(`http://localhost/api/products/${productId}/movements`, { method: 'GET' }),
    { params: { id: productId } },
  );
}

describe('Integration — GET /api/products/[id]/movements', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
  });

  it('returns 404 when the product does not exist', async () => {
    const res = await getHistory('does-not-exist');
    const { status, body } = await readJson(res);

    expect(status).toBe(404);
    expect(body.error?.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('returns an empty history for a product without movements', async () => {
    const productId = await createProduct();

    const res = await getHistory(productId);
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it('returns movements newest-first with date, type, quantity and resulting stock', async () => {
    const productId = await createProduct(); // initial stock = 30
    await registerMovement(productId, 'INGRESO', 10); // → 40
    await registerMovement(productId, 'EGRESO', 15); //  → 25

    const res = await getHistory(productId);
    const { status, body } = await readJson(res);

    expect(status).toBe(200);
    const data = body.data as Array<{
      id: string;
      date: string;
      type: string;
      quantity: number;
      resultingStock: number;
    }>;

    expect(data).toHaveLength(2);
    expect(data[0]?.type).toBe('OUTBOUND');
    expect(data[0]?.quantity).toBe(15);
    expect(data[0]?.resultingStock).toBe(25);
    expect(data[1]?.type).toBe('INBOUND');
    expect(data[1]?.quantity).toBe(10);
    expect(data[1]?.resultingStock).toBe(40);

    for (const movement of data) {
      expect(movement.id).toBeTruthy();
      expect(new Date(movement.date).getTime()).not.toBeNaN();
    }

    // Newest first
    const [newest, oldest] = data;
    expect(new Date(newest?.date ?? '').getTime()).toBeGreaterThanOrEqual(
      new Date(oldest?.date ?? '').getTime(),
    );
  });
});
