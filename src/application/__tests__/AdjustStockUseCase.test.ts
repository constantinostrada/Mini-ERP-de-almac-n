import { Product } from '@/domain/entities/Product';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import { AdjustStockUseCase } from '../use-cases/stock/AdjustStockUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  private n = 0;
  generate(): string { return `mov-${++this.n}`; }
}

function makeProductInRepo(repo: InMemoryProductRepository, stock = 50): string {
  const id = 'prod-abc';
  const product = Product.create({
    id: ProductId.create(id),
    sku: SKU.create('ITEM-01'),
    name: 'Item de prueba',
    description: '',
    unitPrice: Money.fromDecimal(5, 'EUR'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  repo.seed([product]);
  return id;
}

describe('AdjustStockUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let useCase: AdjustStockUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    useCase = new AdjustStockUseCase(productRepo, movementRepo, new FixedIdGenerator());
  });

  it('records an INBOUND movement and increases stock', async () => {
    const productId = makeProductInRepo(productRepo, 50);

    const movement = await useCase.execute({
      productId,
      type: 'INBOUND',
      quantity: 20,
      unitCostAmount: 3.0,
      unitCostCurrency: 'EUR',
      reason: 'Recepción de pedido #42',
    });

    expect(movement.type).toBe('INBOUND');
    expect(movement.quantity).toBe(20);

    const updated = await productRepo.findById(ProductId.create(productId));
    expect(updated?.stockQuantity.value).toBe(70);
  });

  it('records an OUTBOUND movement and decreases stock', async () => {
    const productId = makeProductInRepo(productRepo, 50);

    await useCase.execute({
      productId,
      type: 'OUTBOUND',
      quantity: 15,
      unitCostAmount: 5.0,
      unitCostCurrency: 'EUR',
      reason: 'Pedido de venta #7',
    });

    const updated = await productRepo.findById(ProductId.create(productId));
    expect(updated?.stockQuantity.value).toBe(35);
  });

  it('throws when outbound exceeds available stock', async () => {
    const productId = makeProductInRepo(productRepo, 5);

    await expect(
      useCase.execute({
        productId,
        type: 'OUTBOUND',
        quantity: 10,
        unitCostAmount: 5.0,
        unitCostCurrency: 'EUR',
        reason: 'Test',
      }),
    ).rejects.toThrow(/Insufficient stock/);
  });
});
