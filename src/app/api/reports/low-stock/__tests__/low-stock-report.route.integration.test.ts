import { NextRequest } from 'next/server';

import { Product } from '@/domain/entities/Product';
import { StockMovement } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { GET as lowStockReportHandler } from '../route';

const productRepo = container.productRepository as InMemoryProductRepository;
const movementRepo = container.stockMovementRepository as InMemoryStockMovementRepository;

interface ProductSpec {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
}

function buildProduct(spec: ProductSpec): Product {
  return Product.create({
    id: ProductId.create(spec.id),
    sku: SKU.create(spec.sku),
    name: spec.name,
    description: '',
    unitPrice: Money.fromDecimal(10, 'EUR'),
    stockQuantity: Quantity.create(spec.stock),
    reorderThreshold: Quantity.create(spec.minStock),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

function buildMovement(productId: string, occurredAt: Date, idSuffix: string): StockMovement {
  return StockMovement.create({
    id: `mov-${idSuffix}`,
    productId: ProductId.create(productId),
    type: 'INBOUND',
    quantity: Quantity.create(1),
    unitCost: Money.fromDecimal(10, 'EUR'),
    reason: 'fixture',
    occurredAt,
  });
}

const HEALTHY: ProductSpec = {
  id: 'prod-healthy',
  sku: 'WH-HEALTHY',
  name: 'Producto saludable',
  stock: 50,
  minStock: 10,
};

const EARLY_ALERT: ProductSpec = {
  id: 'prod-alert',
  sku: 'WH-ALERT',
  name: 'Producto en alerta temprana',
  stock: 11,
  minStock: 10,
};

const CRITICAL: ProductSpec = {
  id: 'prod-critical',
  sku: 'WH-CRITICAL',
  name: 'Producto crítico',
  stock: 2,
  minStock: 10,
};

function makeRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'GET' });
}

async function readJson(res: Response): Promise<{
  status: number;
  body: {
    success: boolean;
    data?: unknown;
    error?: { code: string; message: string };
  };
}> {
  return { status: res.status, body: await res.json() };
}

describe('Integration — GET /api/reports/low-stock', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
    productRepo.seed([buildProduct(HEALTHY), buildProduct(EARLY_ALERT), buildProduct(CRITICAL)]);
  });

  describe('default request (no threshold_pct)', () => {
    it('returns only products at or below min_stock and excludes the healthy and early-alert ones', async () => {
      const res = await lowStockReportHandler(makeRequest('http://localhost/api/reports/low-stock'));
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      const data = body.data as Array<{ sku: string }>;
      expect(data).toHaveLength(1);
      expect(data[0]!.sku).toBe('WH-CRITICAL');
    });

    it('returns each line with the documented snake_case shape', async () => {
      const res = await lowStockReportHandler(makeRequest('http://localhost/api/reports/low-stock'));
      const { body } = await readJson(res);
      const data = body.data as Array<Record<string, unknown>>;
      const line = data[0]!;

      expect(Object.keys(line).sort()).toEqual(
        ['current_stock', 'deficit', 'last_movement_at', 'min_stock', 'name', 'sku'].sort(),
      );
      expect(line['sku']).toBe('WH-CRITICAL');
      expect(line['name']).toBe('Producto crítico');
      expect(line['current_stock']).toBe(2);
      expect(line['min_stock']).toBe(10);
      expect(line['deficit']).toBe(8);
      expect(line['last_movement_at']).toBeNull();
    });

    it('reports last_movement_at as the most recent movement timestamp when movements exist', async () => {
      const older = new Date('2026-03-01T08:00:00.000Z');
      const newer = new Date('2026-04-15T12:30:00.000Z');
      await movementRepo.save(buildMovement(CRITICAL.id, older, 'old'));
      await movementRepo.save(buildMovement(CRITICAL.id, newer, 'new'));

      const res = await lowStockReportHandler(makeRequest('http://localhost/api/reports/low-stock'));
      const { body } = await readJson(res);
      const data = body.data as Array<{ sku: string; last_movement_at: string | null }>;
      const critical = data.find((d) => d.sku === 'WH-CRITICAL')!;

      expect(critical.last_movement_at).toBe(newer.toISOString());
    });
  });

  describe('with threshold_pct (early alert)', () => {
    it('also includes products whose stock is within the threshold buffer above min_stock', async () => {
      const res = await lowStockReportHandler(
        makeRequest('http://localhost/api/reports/low-stock?threshold_pct=20'),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(200);
      const data = body.data as Array<{ sku: string }>;
      const skus = data.map((d) => d.sku);
      expect(skus).toContain('WH-CRITICAL');
      expect(skus).toContain('WH-ALERT');
      expect(skus).not.toContain('WH-HEALTHY');
    });

    it('orders results by (min_stock - current_stock) descending — most critical first', async () => {
      const res = await lowStockReportHandler(
        makeRequest('http://localhost/api/reports/low-stock?threshold_pct=20'),
      );
      const { body } = await readJson(res);
      const data = body.data as Array<{ sku: string; deficit: number }>;

      expect(data.map((d) => d.sku)).toEqual(['WH-CRITICAL', 'WH-ALERT']);
      expect(data[0]!.deficit).toBe(8);
      expect(data[1]!.deficit).toBe(-1);
    });

    it('does not surface products outside the threshold buffer', async () => {
      const res = await lowStockReportHandler(
        makeRequest('http://localhost/api/reports/low-stock?threshold_pct=5'),
      );
      const { body } = await readJson(res);
      const data = body.data as Array<{ sku: string }>;

      expect(data.map((d) => d.sku)).toEqual(['WH-CRITICAL']);
    });

    it('rejects negative threshold_pct with 400 INVALID_QUERY_PARAM', async () => {
      const res = await lowStockReportHandler(
        makeRequest('http://localhost/api/reports/low-stock?threshold_pct=-1'),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('INVALID_QUERY_PARAM');
    });

    it('rejects non-numeric threshold_pct with 400 INVALID_QUERY_PARAM', async () => {
      const res = await lowStockReportHandler(
        makeRequest('http://localhost/api/reports/low-stock?threshold_pct=abc'),
      );
      const { status, body } = await readJson(res);

      expect(status).toBe(400);
      expect(body.error?.code).toBe('INVALID_QUERY_PARAM');
    });
  });
});
