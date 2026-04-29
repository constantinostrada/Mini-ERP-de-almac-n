import { Product } from '../entities/Product';
import { Money } from '../value-objects/Money';
import { ProductId } from '../value-objects/ProductId';
import { Quantity } from '../value-objects/Quantity';
import { SKU } from '../value-objects/SKU';

function makeProduct(overrides: Partial<{ stock: number; threshold: number }> = {}): Product {
  return Product.create({
    id: ProductId.create('prod-1'),
    sku: SKU.create('PROD-001'),
    name: 'Caja de cartón',
    description: 'Caja de cartón estándar 40×30×20 cm',
    unitPrice: Money.fromDecimal(2.99, 'EUR'),
    stockQuantity: Quantity.create(overrides.stock ?? 50),
    reorderThreshold: Quantity.create(overrides.threshold ?? 10),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}

describe('Product entity', () => {
  it('creates a product with correct initial values', () => {
    const p = makeProduct();
    expect(p.name).toBe('Caja de cartón');
    expect(p.sku.value).toBe('PROD-001');
    expect(p.stockQuantity.value).toBe(50);
    expect(p.needsReorder()).toBe(false);
  });

  it('receives stock correctly', () => {
    const p = makeProduct({ stock: 10 });
    p.receiveStock(Quantity.create(40));
    expect(p.stockQuantity.value).toBe(50);
  });

  it('dispatches stock correctly', () => {
    const p = makeProduct({ stock: 20 });
    p.dispatchStock(Quantity.create(5));
    expect(p.stockQuantity.value).toBe(15);
  });

  it('throws when dispatching more than available stock', () => {
    const p = makeProduct({ stock: 5 });
    expect(() => p.dispatchStock(Quantity.create(10))).toThrow(/Insufficient stock/);
  });

  it('detects when reorder is needed', () => {
    const p = makeProduct({ stock: 10, threshold: 10 });
    expect(p.needsReorder()).toBe(true);
  });

  it('detects when reorder is NOT needed', () => {
    const p = makeProduct({ stock: 11, threshold: 10 });
    expect(p.needsReorder()).toBe(false);
  });

  it('throws on invalid name (too short)', () => {
    expect(() =>
      Product.create({
        id: ProductId.create('p-2'),
        sku: SKU.create('P-002'),
        name: 'A',
        description: '',
        unitPrice: Money.fromDecimal(1, 'EUR'),
        stockQuantity: Quantity.create(0),
        reorderThreshold: Quantity.create(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(/at least 2 characters/);
  });
});
