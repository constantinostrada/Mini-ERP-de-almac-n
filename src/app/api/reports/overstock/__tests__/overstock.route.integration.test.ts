import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import type { OverstockedProductDTO } from '@/application/dtos/ReportDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { POST as createProductHandler } from '../../../products/route';
import { POST as registerMovementHandler } from '../../../movements/route';
import { GET as overstockReportHandler } from '../route';

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

interface SeedSpec {
  sku: string;
  name: string;
  initialStockQuantity: number;
  reorderThreshold: number;
}

async function createProduct(spec: SeedSpec): Promise<string> {
  const payload: CreateProductDTO = {
    sku: spec.sku,
    name: spec.name,
    description: '',
    unitPriceAmount: 1,
    unitPriceCurrency: 'EUR',
    initialStockQuantity: spec.initialStockQuantity,
    reorderThreshold: spec.reorderThreshold,
  };
  const res = await createProductHandler(
    jsonRequest('http://localhost/api/products', 'POST', payload),
  );
  const { body } = await readJson(res);
  return (body.data as { id: string }).id;
}

describe('Integration — GET /api/reports/overstock', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
  });

  describe('with 4 fixtures: critical overstock, mild overstock, normal range, min_stock=0', () => {
    let mildId: string;

    beforeEach(async () => {
      // 1) Critical overstock: 100 vs min 10 → ratio 10.0
      await createProduct({
        sku: 'OVR-CRIT',
        name: 'Critical Overstock',
        initialStockQuantity: 100,
        reorderThreshold: 10,
      });
      // 2) Mild overstock: 25 vs min 10 → ratio 2.5
      mildId = await createProduct({
        sku: 'OVR-MILD',
        name: 'Mild Overstock',
        initialStockQuantity: 25,
        reorderThreshold: 10,
      });
      // 3) Normal range: 12 vs min 10 → ratio 1.2 (below default 2.0)
      await createProduct({
        sku: 'OVR-NORM',
        name: 'Normal Range',
        initialStockQuantity: 12,
        reorderThreshold: 10,
      });
      // 4) min_stock = 0: must always be excluded
      await createProduct({
        sku: 'OVR-ZERO',
        name: 'Zero Min Stock',
        initialStockQuantity: 50,
        reorderThreshold: 0,
      });

      // Register a movement on the mild one so last_movement_at is populated
      await registerMovementHandler(
        jsonRequest('http://localhost/api/movements', 'POST', {
          product_id: mildId,
          type: 'INGRESO',
          quantity: 1,
        }),
      );
    });

    it('returns only products with current_stock >= 2 × min_stock when ratio is omitted (default=2)', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock', { method: 'GET' }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);

      const data = body.data as OverstockedProductDTO[];
      const skus = data.map((d) => d.sku);
      expect(skus).toEqual(expect.arrayContaining(['OVR-CRIT', 'OVR-MILD']));
      expect(skus).not.toContain('OVR-NORM');
      expect(skus).not.toContain('OVR-ZERO');
      expect(data).toHaveLength(2);
    });

    it('orders results by excess_ratio descending (most overstocked first)', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock', { method: 'GET' }),
      );
      const { body } = await readJson(res);
      const data = body.data as OverstockedProductDTO[];

      expect(data[0]?.sku).toBe('OVR-CRIT');
      expect(data[0]?.excess_ratio).toBe(10);
      expect(data[1]?.sku).toBe('OVR-MILD');
      expect(data[1]?.excess_ratio).toBe(2.6); // 26 / 10 (25 initial + 1 INGRESO)
      // Strictly descending
      expect(data[0]!.excess_ratio).toBeGreaterThan(data[1]!.excess_ratio);
    });

    it('returns the documented response shape per row', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock', { method: 'GET' }),
      );
      const { body } = await readJson(res);
      const data = body.data as OverstockedProductDTO[];

      const critical = data.find((d) => d.sku === 'OVR-CRIT')!;
      expect(critical).toEqual({
        sku: 'OVR-CRIT',
        name: 'Critical Overstock',
        current_stock: 100,
        min_stock: 10,
        excess_ratio: 10,
        last_movement_at: null, // no movements registered for this one
      });

      const mild = data.find((d) => d.sku === 'OVR-MILD')!;
      expect(mild.current_stock).toBe(26); // 25 initial + 1 INGRESO
      expect(mild.min_stock).toBe(10);
      expect(mild.excess_ratio).toBe(2.6);
      expect(typeof mild.last_movement_at).toBe('string');
      expect(() => new Date(mild.last_movement_at as string).toISOString()).not.toThrow();
    });

    it('always excludes products with min_stock = 0 regardless of ratio', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock?ratio=1', { method: 'GET' }),
      );
      const { body } = await readJson(res);
      const data = body.data as OverstockedProductDTO[];

      expect(data.map((d) => d.sku)).not.toContain('OVR-ZERO');
    });

    it('honors a custom ratio query param (e.g. ratio=5 keeps only critical)', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock?ratio=5', { method: 'GET' }),
      );
      const { body } = await readJson(res);
      const data = body.data as OverstockedProductDTO[];

      expect(data.map((d) => d.sku)).toEqual(['OVR-CRIT']);
    });

    it('with ratio=1 includes mild, critical, and normal-range (excess_ratio >= 1)', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock?ratio=1', { method: 'GET' }),
      );
      const { body } = await readJson(res);
      const data = body.data as OverstockedProductDTO[];

      const skus = data.map((d) => d.sku);
      expect(skus).toEqual(expect.arrayContaining(['OVR-CRIT', 'OVR-MILD', 'OVR-NORM']));
      expect(skus).not.toContain('OVR-ZERO');
    });

    it('returns 400 INVALID_QUERY_PARAM when ratio is not a number', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock?ratio=abc', { method: 'GET' }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_QUERY_PARAM');
    });

    it('returns 400 INVALID_QUERY_PARAM when ratio < 1', async () => {
      const res = await overstockReportHandler(
        new NextRequest('http://localhost/api/reports/overstock?ratio=0.5', { method: 'GET' }),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_QUERY_PARAM');
    });

  });
});
