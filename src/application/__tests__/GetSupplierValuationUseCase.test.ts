import { Product } from '@/domain/entities/Product';
import { Supplier } from '@/domain/entities/Supplier';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';

import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemorySupplierRepository } from '@/infrastructure/repositories/InMemorySupplierRepository';

import { GetSupplierValuationUseCase } from '../use-cases/valuation/GetSupplierValuationUseCase';

function makeSupplier(id: string, name: string): Supplier {
  return Supplier.create({
    id,
    name,
    contactEmail: `${id}@test.com`,
    contactPhone: '123456789',
    address: 'Calle Falsa 123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeProduct(
  id: string,
  sku: string,
  name: string,
  unitPrice: number,
  stock: number,
  supplierId?: string,
): Product {
  return Product.create({
    id: ProductId.create(id),
    sku: SKU.create(sku),
    name,
    description: '',
    unitPrice: Money.fromDecimal(unitPrice, 'USD'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(1),
    supplierId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetSupplierValuationUseCase', () => {
  let supplierRepo: InMemorySupplierRepository;
  let productRepo: InMemoryProductRepository;
  let useCase: GetSupplierValuationUseCase;

  beforeEach(() => {
    supplierRepo = new InMemorySupplierRepository();
    productRepo = new InMemoryProductRepository();
    useCase = new GetSupplierValuationUseCase(supplierRepo, productRepo);
  });

  it('returns an empty report when there are no suppliers', async () => {
    const result = await useCase.execute({ currency: 'USD' });

    expect(result.lines).toEqual([]);
    expect(result.currency).toBe('USD');
    expect(new Date(result.generatedAt).getTime()).not.toBeNaN();
  });

  it('aggregates product count, units in stock and total value per supplier', async () => {
    await supplierRepo.save(makeSupplier('sup-1', 'Aceros SA'));
    await supplierRepo.save(makeSupplier('sup-2', 'Tornillos SL'));
    productRepo.seed([
      makeProduct('p1', 'SKU-1', 'Chapa', 10, 5, 'sup-1'), //   50.00
      makeProduct('p2', 'SKU-2', 'Perfil', 2.5, 4, 'sup-1'), // 10.00
      makeProduct('p3', 'SKU-3', 'Tornillo', 0.1, 100, 'sup-2'), // 10.00
    ]);

    const result = await useCase.execute({ currency: 'USD' });

    expect(result.lines).toEqual([
      {
        supplierId: 'sup-1',
        supplierName: 'Aceros SA',
        productCount: 2,
        totalUnits: 9,
        totalValueAmount: 60,
        currency: 'USD',
      },
      {
        supplierId: 'sup-2',
        supplierName: 'Tornillos SL',
        productCount: 1,
        totalUnits: 100,
        totalValueAmount: 10,
        currency: 'USD',
      },
    ]);
  });

  it('reports zero for suppliers without products and excludes unassigned products', async () => {
    await supplierRepo.save(makeSupplier('sup-1', 'Sin Stock SA'));
    productRepo.seed([makeProduct('p1', 'SKU-1', 'Huérfano', 99, 3)]); // no supplierId

    const result = await useCase.execute({ currency: 'USD' });

    expect(result.lines).toEqual([
      {
        supplierId: 'sup-1',
        supplierName: 'Sin Stock SA',
        productCount: 0,
        totalUnits: 0,
        totalValueAmount: 0,
        currency: 'USD',
      },
    ]);
  });
});
