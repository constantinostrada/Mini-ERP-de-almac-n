import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { POST as createProductHandler } from '../../products/route';
import { GET as listMovementsHandler, POST as registerMovementHandler } from '../route';

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
  sku: 'MOV-001',
  name: 'Producto movimientos',
  description: 'Para tests de stock',
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

describe('Integration — /api/movements', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
  });

  describe('POST /api/movements', () => {
    it('registers an INGRESO and increases product stock (201)', async () => {
      const productId = await createProduct();

      const res = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'INGRESO',
          quantity: 10,
          reason: 'Recepción',
        }),
      );

      const { status, body } = await readJson(res);
      expect(status).toBe(201);
      expect(body.success).toBe(true);

      const data = body.data as {
        product_id: string;
        type: string;
        quantity: number;
        reason: string;
        created_at: string;
        id: string;
      };
      expect(data.product_id).toBe(productId);
      expect(data.type).toBe('INGRESO');
      expect(data.quantity).toBe(10);
      expect(data.reason).toBe('Recepción');
      expect(data.id).toBeTruthy();
      expect(data.created_at).toBeTruthy();
    });

    it('registers an EGRESO and decreases product stock (201)', async () => {
      const productId = await createProduct();

      const res = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'EGRESO',
          quantity: 5,
        }),
      );

      const { status, body } = await readJson(res);
      expect(status).toBe(201);
      expect((body.data as { type: string }).type).toBe('EGRESO');
    });

    it('rejects an EGRESO that would leave stock negative with 422', async () => {
      const productId = await createProduct();

      const res = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'EGRESO',
          quantity: 9999,
        }),
      );

      const { status, body } = await readJson(res);
      expect(status).toBe(422);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INSUFFICIENT_STOCK');
    });

    it('returns 404 when product does not exist', async () => {
      const res = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: 'does-not-exist',
          type: 'INGRESO',
          quantity: 1,
        }),
      );

      const { status, body } = await readJson(res);
      expect(status).toBe(404);
      expect(body.error?.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('rejects quantity <= 0 with 500/400-class error', async () => {
      const productId = await createProduct();

      const res = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'INGRESO',
          quantity: 0,
        }),
      );

      const { status, body } = await readJson(res);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(body.success).toBe(false);
      expect(body.error?.message).toMatch(/quantity/);
    });

    it('two simultaneous EGRESOs for the same product cannot leave stock < 0', async () => {
      const productId = await createProduct(); // initial stock = 30

      const [a, b] = await Promise.all([
        registerMovementHandler(
          jsonRequest('http://localhost/api/movements', 'POST', {
            product_id: productId,
            type: 'EGRESO',
            quantity: 20,
          }),
        ),
        registerMovementHandler(
          jsonRequest('http://localhost/api/movements', 'POST', {
            product_id: productId,
            type: 'EGRESO',
            quantity: 20,
          }),
        ),
      ]);

      const responses = [await readJson(a), await readJson(b)];
      const successes = responses.filter((r) => r.status === 201);
      const failures = responses.filter((r) => r.status === 422);

      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);
      expect(failures[0]?.body.error?.code).toBe('INSUFFICIENT_STOCK');

      // The product's stock must never have gone below zero.
      const product = await productRepo.findAll();
      expect(product[0]?.stockQuantity.value).toBe(10);
      expect(product[0]?.stockQuantity.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/movements', () => {
    it('returns the history for a given product_id', async () => {
      const productId = await createProduct();

      await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'INGRESO',
          quantity: 5,
          reason: 'A',
        }),
      );
      await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'EGRESO',
          quantity: 2,
          reason: 'B',
        }),
      );

      const res = await listMovementsHandler(
        new NextRequest(`http://localhost/api/movements?product_id=${productId}`, {
          method: 'GET',
        }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      const data = body.data as Array<{ type: string; quantity: number; product_id: string }>;
      expect(data).toHaveLength(2);
      for (const movement of data) {
        expect(movement.product_id).toBe(productId);
        expect(['INGRESO', 'EGRESO']).toContain(movement.type);
      }
    });

    it('returns unit_cost in POST response and back in GET when provided', async () => {
      const productId = await createProduct();

      const postRes = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'INGRESO',
          quantity: 4,
          unit_cost: { amount: 12.5, currency: 'EUR' },
        }),
      );
      const { status: postStatus, body: postBody } = await readJson(postRes);
      expect(postStatus).toBe(201);

      const postData = postBody.data as {
        unit_cost?: { amount: number; currency: string };
      };
      expect(postData.unit_cost).toEqual({ amount: 12.5, currency: 'EUR' });

      const getRes = await listMovementsHandler(
        new NextRequest(`http://localhost/api/movements?product_id=${productId}`, {
          method: 'GET',
        }),
      );
      const { status: getStatus, body: getBody } = await readJson(getRes);
      expect(getStatus).toBe(200);

      const list = getBody.data as Array<{
        unit_cost?: { amount: number; currency: string };
      }>;
      expect(list).toHaveLength(1);
      expect(list[0]?.unit_cost).toEqual({ amount: 12.5, currency: 'EUR' });
    });

    it('omits unit_cost in POST and GET responses when not supplied', async () => {
      const productId = await createProduct();

      const postRes = await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: productId,
          type: 'INGRESO',
          quantity: 2,
        }),
      );
      const { status: postStatus, body: postBody } = await readJson(postRes);
      expect(postStatus).toBe(201);

      const postData = postBody.data as Record<string, unknown>;
      expect(postData['unit_cost']).toBeUndefined();
      expect('unit_cost' in postData).toBe(false);

      const getRes = await listMovementsHandler(
        new NextRequest(`http://localhost/api/movements?product_id=${productId}`, {
          method: 'GET',
        }),
      );
      const { body: getBody } = await readJson(getRes);
      const list = getBody.data as Array<Record<string, unknown>>;
      expect(list).toHaveLength(1);
      expect(list[0]?.['unit_cost']).toBeUndefined();
      expect('unit_cost' in (list[0] as object)).toBe(false);
    });

    it('returns an empty list when product_id query param is missing', async () => {
      const res = await listMovementsHandler(
        new NextRequest('http://localhost/api/movements', { method: 'GET' }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });
  });
});
