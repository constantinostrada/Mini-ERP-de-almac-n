import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { GET as listProductsHandler, POST as createProductHandler } from '../route';
import {
  GET as getProductByIdHandler,
  PUT as updateProductHandler,
  DELETE as deleteProductHandler,
} from '../[id]/route';

const repo = container.productRepository as InMemoryProductRepository;

const validBody: CreateProductDTO = {
  sku: 'INT-001',
  name: 'Producto integración',
  description: 'Caja de cartón',
  unitPriceAmount: 9.99,
  unitPriceCurrency: 'EUR',
  initialStockQuantity: 25,
  reorderThreshold: 5,
};

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

describe('Integration — /api/products', () => {
  beforeEach(() => {
    repo.clear();
  });

  describe('POST /api/products', () => {
    it('creates a product and returns 201 with the persisted DTO', async () => {
      const res = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      const data = body.data as { id: string; sku: string; stockQuantity: number };
      expect(data.id).toBeTruthy();
      expect(data.sku).toBe('INT-001');
      expect(data.stockQuantity).toBe(25);

      const persisted = await repo.findAll();
      expect(persisted).toHaveLength(1);
    });

    it('rejects creation with duplicate SKU returning 409 DUPLICATE_SKU', async () => {
      await createProductHandler(jsonRequest('http://localhost/api/products', 'POST', validBody));
      const res = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('DUPLICATE_SKU');
    });
  });

  describe('GET /api/products', () => {
    it('returns the paginated catalog with default page=1 pageSize=20', async () => {
      await createProductHandler(jsonRequest('http://localhost/api/products', 'POST', validBody));
      await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', { ...validBody, sku: 'INT-002' }),
      );

      const res = await listProductsHandler(jsonRequest('http://localhost/api/products', 'GET'));
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      const data = body.data as {
        items: Array<{ sku: string }>;
        pagination: { page: number; pageSize: number; total: number; totalPages: number };
      };
      expect(data.items).toHaveLength(2);
      expect(data.items.map((p) => p.sku).sort()).toEqual(['INT-001', 'INT-002']);
      expect(data.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
      });
    });

    describe('with a 25-product fixture', () => {
      beforeEach(async () => {
        for (let i = 1; i <= 25; i++) {
          await createProductHandler(
            jsonRequest('http://localhost/api/products', 'POST', {
              ...validBody,
              sku: `PAG-${String(i).padStart(3, '0')}`,
              name: `Producto ${i}`,
            }),
          );
        }
      });

      it('page 1 with pageSize=20 returns 20 items and total reflects the count', async () => {
        const res = await listProductsHandler(
          jsonRequest('http://localhost/api/products?page=1&pageSize=20', 'GET'),
        );
        const { status, body } = await readJson(res);
        expect(status).toBe(200);
        const data = body.data as {
          items: Array<{ sku: string }>;
          pagination: { page: number; pageSize: number; total: number; totalPages: number };
        };
        expect(data.items).toHaveLength(20);
        expect(data.pagination).toEqual({
          page: 1,
          pageSize: 20,
          total: 25,
          totalPages: 2,
        });
      });

      it('page 2 with pageSize=20 returns the next 5 items, disjoint from page 1', async () => {
        const page1Res = await listProductsHandler(
          jsonRequest('http://localhost/api/products?page=1&pageSize=20', 'GET'),
        );
        const page2Res = await listProductsHandler(
          jsonRequest('http://localhost/api/products?page=2&pageSize=20', 'GET'),
        );
        const page1 = (await readJson(page1Res)).body.data as {
          items: Array<{ sku: string }>;
        };
        const page2Body = await readJson(page2Res);
        const page2 = page2Body.body.data as {
          items: Array<{ sku: string }>;
          pagination: { page: number; pageSize: number; total: number; totalPages: number };
        };

        expect(page2.items).toHaveLength(5);
        expect(page2.pagination).toEqual({
          page: 2,
          pageSize: 20,
          total: 25,
          totalPages: 2,
        });

        const page1Skus = new Set(page1.items.map((p) => p.sku));
        for (const item of page2.items) {
          expect(page1Skus.has(item.sku)).toBe(false);
        }
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns the product when it exists', async () => {
      const created = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const { body: createdBody } = await readJson(created);
      const id = (createdBody.data as { id: string }).id;

      const res = await getProductByIdHandler(
        jsonRequest(`http://localhost/api/products/${id}`, 'GET'),
        { params: { id } },
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect((body.data as { id: string }).id).toBe(id);
    });

    it('returns 404 PRODUCT_NOT_FOUND for an unknown id', async () => {
      const res = await getProductByIdHandler(
        jsonRequest('http://localhost/api/products/missing-id', 'GET'),
        { params: { id: 'missing-id' } },
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(404);
      expect(body.error?.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates name, description, price and reorder threshold', async () => {
      const created = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const id = ((await readJson(created)).body.data as { id: string }).id;

      const res = await updateProductHandler(
        jsonRequest(`http://localhost/api/products/${id}`, 'PUT', {
          name: 'Producto actualizado',
          description: 'Nueva descripción',
          unitPriceAmount: 12.5,
          unitPriceCurrency: 'EUR',
          reorderThreshold: 3,
        }),
        { params: { id } },
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      const data = body.data as {
        name: string;
        description: string;
        unitPriceAmount: number;
        reorderThreshold: number;
      };
      expect(data.name).toBe('Producto actualizado');
      expect(data.description).toBe('Nueva descripción');
      expect(data.unitPriceAmount).toBe(12.5);
      expect(data.reorderThreshold).toBe(3);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('removes the product and subsequent reads return 404', async () => {
      const created = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const id = ((await readJson(created)).body.data as { id: string }).id;

      const delRes = await deleteProductHandler(
        jsonRequest(`http://localhost/api/products/${id}`, 'DELETE'),
        { params: { id } },
      );
      expect(delRes.status).toBe(200);

      const getRes = await getProductByIdHandler(
        jsonRequest(`http://localhost/api/products/${id}`, 'GET'),
        { params: { id } },
      );
      expect(getRes.status).toBe(404);
      expect(await repo.findAll()).toHaveLength(0);
    });
  });
});
