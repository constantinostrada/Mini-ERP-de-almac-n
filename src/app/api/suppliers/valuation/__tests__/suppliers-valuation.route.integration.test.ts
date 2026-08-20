import { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import type { CreateSupplierDTO } from '@/application/dtos/SupplierDTO';
import type { SupplierValuationDTO } from '@/application/dtos/SupplierValuationDTO';

import { container } from '@/infrastructure/container/Container';

import { POST as createProductHandler } from '../../../products/route';
import { POST as createSupplierHandler } from '../../route';
import { GET as supplierValuationHandler } from '../route';

const productRepo = container.productRepository;
const supplierRepo = container.supplierRepository;

function jsonRequest(url: string, method: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function createSupplier(name: string): Promise<string> {
  const payload: CreateSupplierDTO = {
    name,
    contactEmail: 'ventas@test.com',
    contactPhone: '123456789',
    address: 'Calle Falsa 123',
  };
  const res = await createSupplierHandler(
    jsonRequest('http://localhost/api/suppliers', 'POST', payload),
  );
  const body = (await res.json()) as { data: { id: string } };
  return body.data.id;
}

async function createProduct(
  sku: string,
  unitPriceAmount: number,
  initialStockQuantity: number,
  supplierId?: string,
): Promise<void> {
  const payload: CreateProductDTO = {
    sku,
    name: `Producto ${sku}`,
    description: '',
    unitPriceAmount,
    unitPriceCurrency: 'USD',
    initialStockQuantity,
    reorderThreshold: 1,
    supplierId,
  };
  await createProductHandler(jsonRequest('http://localhost/api/products', 'POST', payload));
}

async function getValuation(query = ''): Promise<Response> {
  return supplierValuationHandler(
    new NextRequest(`http://localhost/api/suppliers/valuation${query}`, { method: 'GET' }),
  );
}

describe('Integration — GET /api/suppliers/valuation', () => {
  beforeEach(() => {
    productRepo.clear();
    supplierRepo.clear();
  });

  it('returns an empty report when there are no suppliers', async () => {
    const res = await getValuation();
    const body = (await res.json()) as { success: boolean; data: SupplierValuationDTO };

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.lines).toEqual([]);
    expect(body.data.currency).toBe('USD');
  });

  it('returns one line per supplier with product count, units and total value', async () => {
    const supplierA = await createSupplier('Aceros SA');
    const supplierB = await createSupplier('Tornillos SL');
    await createProduct('VAL-001', 10, 5, supplierA); //  50.00
    await createProduct('VAL-002', 2.5, 4, supplierA); // 10.00
    await createProduct('VAL-003', 0.1, 100, supplierB); // 10.00
    await createProduct('VAL-004', 99, 3); // sin proveedor — excluido

    const res = await getValuation('?currency=USD');
    const body = (await res.json()) as { data: SupplierValuationDTO };

    expect(res.status).toBe(200);
    expect(body.data.lines).toHaveLength(2);

    const lineA = body.data.lines.find((l) => l.supplierId === supplierA);
    expect(lineA).toMatchObject({
      supplierName: 'Aceros SA',
      productCount: 2,
      totalUnits: 9,
      totalValueAmount: 60,
      currency: 'USD',
    });

    const lineB = body.data.lines.find((l) => l.supplierId === supplierB);
    expect(lineB).toMatchObject({
      supplierName: 'Tornillos SL',
      productCount: 1,
      totalUnits: 100,
      totalValueAmount: 10,
      currency: 'USD',
    });
  });

  it('reports zeroes for a supplier without products', async () => {
    await createSupplier('Sin Stock SA');

    const res = await getValuation();
    const body = (await res.json()) as { data: SupplierValuationDTO };

    expect(body.data.lines).toEqual([
      expect.objectContaining({
        supplierName: 'Sin Stock SA',
        productCount: 0,
        totalUnits: 0,
        totalValueAmount: 0,
      }),
    ]);
  });
});
