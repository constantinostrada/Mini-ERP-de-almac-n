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

    it('creates a product WITHOUT notes — notes is undefined in the response', async () => {
      const res = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', { ...validBody, sku: 'INT-NO-NOTES' }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(201);
      const data = body.data as { notes?: string };
      expect(data.notes).toBeUndefined();
    });

    it('creates a product WITH notes and exposes them via GET', async () => {
      const noteText = 'Producto sensible — almacenar refrigerado';
      const created = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', {
          ...validBody,
          sku: 'INT-WITH-NOTES',
          notes: noteText,
        }),
      );
      const { status: createStatus, body: createBody } = await readJson(created);
      expect(createStatus).toBe(201);
      const createdData = createBody.data as { id: string; notes?: string };
      expect(createdData.notes).toBe(noteText);

      const getRes = await getProductByIdHandler(
        jsonRequest(`http://localhost/api/products/${createdData.id}`, 'GET'),
        { params: { id: createdData.id } },
      );
      const { status: getStatus, body: getBody } = await readJson(getRes);
      expect(getStatus).toBe(200);
      expect((getBody.data as { notes?: string }).notes).toBe(noteText);
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
    it('lists all products', async () => {
      await createProductHandler(jsonRequest('http://localhost/api/products', 'POST', validBody));
      await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', { ...validBody, sku: 'INT-002' }),
      );

      const res = await listProductsHandler();
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      const data = body.data as Array<{ sku: string }>;
      expect(data).toHaveLength(2);
      expect(data.map((p) => p.sku).sort()).toEqual(['INT-001', 'INT-002']);
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

    it('persists notes on update and returns them via PUT', async () => {
      const created = await createProductHandler(
        jsonRequest('http://localhost/api/products', 'POST', validBody),
      );
      const id = ((await readJson(created)).body.data as { id: string }).id;

      const res = await updateProductHandler(
        jsonRequest(`http://localhost/api/products/${id}`, 'PUT', {
          name: 'Producto con nota',
          description: 'desc',
          notes: 'Cliente VIP — entrega urgente',
          unitPriceAmount: 1,
          unitPriceCurrency: 'EUR',
          reorderThreshold: 1,
        }),
        { params: { id } },
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      const data = body.data as { notes?: string };
      expect(data.notes).toBe('Cliente VIP — entrega urgente');
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
