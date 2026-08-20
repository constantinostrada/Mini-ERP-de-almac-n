import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import type { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import type { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { POST as registerMovementHandler } from '../../route';
import { POST as createProductHandler } from '../../../products/route';
import { GET as exportHandler } from '../route';

const productRepo = container.productRepository as InMemoryProductRepository;
const movementRepo = container.stockMovementRepository as InMemoryStockMovementRepository;

function jsonRequest(url: string, method: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function createProduct(payload: CreateProductDTO): Promise<string> {
  const res = await createProductHandler(
    jsonRequest('http://localhost/api/products', 'POST', payload),
  );
  const body = (await res.json()) as { data: { id: string } };
  return body.data.id;
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

describe('Integration — GET /api/movements/export', () => {
  beforeEach(() => {
    productRepo.clear();
    movementRepo.clear();
  });

  it('returns an empty CSV (header only) with download headers when there are no movements', async () => {
    const res = await exportHandler();

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="stock-movements.csv"',
    );
    expect(await res.text()).toBe('fecha,producto,sku,tipo,cantidad,stock_resultante\r\n');
  });

  it('exports every movement with date, product, SKU, type, quantity and resulting stock', async () => {
    const productId = await createProduct({
      sku: 'EXP-001',
      name: 'Producto simple',
      description: '',
      unitPriceAmount: 2,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 2,
    });
    await registerMovement(productId, 'INGRESO', 5); // → 15
    await registerMovement(productId, 'EGRESO', 3); //  → 12

    const res = await exportHandler();
    const lines = (await res.text()).trimEnd().split('\r\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('fecha,producto,sku,tipo,cantidad,stock_resultante');
    // Newest first
    expect(lines[1]).toMatch(/^[^,]+,Producto simple,EXP-001,OUTBOUND,3,12$/);
    expect(lines[2]).toMatch(/^[^,]+,Producto simple,EXP-001,INBOUND,5,15$/);
    for (const line of lines.slice(1)) {
      const date = line.split(',')[0] ?? '';
      expect(new Date(date).getTime()).not.toBeNaN();
    }
  });

  it('escapes product names containing commas and double quotes', async () => {
    const productId = await createProduct({
      sku: 'EXP-002',
      name: 'Tornillo "inox", 5mm',
      description: '',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 0,
      reorderThreshold: 1,
    });
    await registerMovement(productId, 'INGRESO', 4); // → 4

    const res = await exportHandler();
    const lines = (await res.text()).trimEnd().split('\r\n');

    expect(lines).toHaveLength(2);
    expect(lines[1]).toMatch(/^[^,]+,"Tornillo ""inox"", 5mm",EXP-002,INBOUND,4,4$/);
  });
});
