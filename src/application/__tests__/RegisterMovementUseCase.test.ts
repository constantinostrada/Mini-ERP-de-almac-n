import { Product } from '@/domain/entities/Product';
import { InsufficientStockException, ProductNotFoundException } from '@/domain/exceptions/DomainException';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';
import { InMemoryMutex } from '@/infrastructure/concurrency/InMemoryMutex';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '@/infrastructure/repositories/InMemoryStockMovementRepository';

import type { IIdGenerator } from '../ports/IIdGenerator';
import { RegisterMovementUseCase } from '../use-cases/stock/RegisterMovementUseCase';

class SequentialIdGenerator implements IIdGenerator {
  private n = 0;
  generate(): string {
    return `mov-${++this.n}`;
  }
}

function seedProduct(repo: InMemoryProductRepository, id: string, stock: number): void {
  const product = Product.create({
    id: ProductId.create(id),
    sku: SKU.create(`SKU-${id}`),
    name: `Product ${id}`,
    description: '',
    unitPrice: Money.fromDecimal(10, 'EUR'),
    stockQuantity: Quantity.create(stock),
    reorderThreshold: Quantity.create(0),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  repo.seed([product]);
}

describe('RegisterMovementUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let movementRepo: InMemoryStockMovementRepository;
  let mutex: InMemoryMutex;
  let useCase: RegisterMovementUseCase;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    movementRepo = new InMemoryStockMovementRepository();
    mutex = new InMemoryMutex();
    useCase = new RegisterMovementUseCase(
      productRepo,
      movementRepo,
      new SequentialIdGenerator(),
      mutex,
    );
  });

  it('registers an INGRESO movement, increments stock, and persists the movement', async () => {
    seedProduct(productRepo, 'p1', 50);

    const result = await useCase.execute({
      productId: 'p1',
      type: 'INGRESO',
      quantity: 20,
      reason: 'Recepción de pedido #42',
    });

    expect(result.id).toBe('mov-1');
    expect(result.product_id).toBe('p1');
    expect(result.type).toBe('INGRESO');
    expect(result.quantity).toBe(20);
    expect(result.reason).toBe('Recepción de pedido #42');
    expect(typeof result.created_at).toBe('string');

    const updated = await productRepo.findById(ProductId.create('p1'));
    expect(updated?.stockQuantity.value).toBe(70);

    const stored = await movementRepo.findByProductId(ProductId.create('p1'));
    expect(stored).toHaveLength(1);
    expect(stored[0]?.type).toBe('INBOUND');
  });

  it('registers an EGRESO movement and decrements stock', async () => {
    seedProduct(productRepo, 'p1', 50);

    const result = await useCase.execute({
      productId: 'p1',
      type: 'EGRESO',
      quantity: 15,
    });

    expect(result.type).toBe('EGRESO');
    expect(result.reason).toBeUndefined();

    const updated = await productRepo.findById(ProductId.create('p1'));
    expect(updated?.stockQuantity.value).toBe(35);
  });

  it('rejects EGRESO that would leave stock negative with InsufficientStockException', async () => {
    seedProduct(productRepo, 'p1', 5);

    await expect(
      useCase.execute({ productId: 'p1', type: 'EGRESO', quantity: 10 }),
    ).rejects.toBeInstanceOf(InsufficientStockException);

    const product = await productRepo.findById(ProductId.create('p1'));
    expect(product?.stockQuantity.value).toBe(5);

    const movements = await movementRepo.findByProductId(ProductId.create('p1'));
    expect(movements).toHaveLength(0);
  });

  it('throws ProductNotFoundException when product is unknown', async () => {
    await expect(
      useCase.execute({ productId: 'missing', type: 'INGRESO', quantity: 1 }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it('rejects non-positive quantities', async () => {
    seedProduct(productRepo, 'p1', 50);

    await expect(
      useCase.execute({ productId: 'p1', type: 'INGRESO', quantity: 0 }),
    ).rejects.toThrow(/quantity must be an integer greater than zero/);

    await expect(
      useCase.execute({ productId: 'p1', type: 'INGRESO', quantity: -5 }),
    ).rejects.toThrow(/quantity must be an integer greater than zero/);
  });

  it('rejects unknown movement types', async () => {
    seedProduct(productRepo, 'p1', 50);

    await expect(
      useCase.execute({
        productId: 'p1',
        type: 'BOGUS' as 'INGRESO',
        quantity: 1,
      }),
    ).rejects.toThrow(/Invalid movement type/);
  });

  it('serializes concurrent EGRESOs so stock never goes negative', async () => {
    seedProduct(productRepo, 'p1', 10);

    // Slow down the repository update so reads/writes can interleave
    // without the mutex. With the mutex, the second EGRESO sees the
    // updated stock and is rejected.
    const realUpdate = productRepo.update.bind(productRepo);
    productRepo.update = async (product) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return realUpdate(product);
    };

    const results = await Promise.allSettled([
      useCase.execute({ productId: 'p1', type: 'EGRESO', quantity: 7 }),
      useCase.execute({ productId: 'p1', type: 'EGRESO', quantity: 7 }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      InsufficientStockException,
    );

    const product = await productRepo.findById(ProductId.create('p1'));
    expect(product).not.toBeNull();
    expect(product!.stockQuantity.value).toBe(3);
    expect(product!.stockQuantity.value).toBeGreaterThanOrEqual(0);

    const movements = await movementRepo.findByProductId(ProductId.create('p1'));
    expect(movements).toHaveLength(1);
  });

  it('does not lock unrelated products against each other', async () => {
    seedProduct(productRepo, 'p1', 10);
    seedProduct(productRepo, 'p2', 10);

    const order: string[] = [];

    const realUpdate = productRepo.update.bind(productRepo);
    productRepo.update = async (product) => {
      // Hold p1 longer; p2 should not have to wait for it.
      const delay = product.id.value === 'p1' ? 30 : 1;
      await new Promise((resolve) => setTimeout(resolve, delay));
      order.push(product.id.value);
      return realUpdate(product);
    };

    await Promise.all([
      useCase.execute({ productId: 'p1', type: 'EGRESO', quantity: 1 }),
      useCase.execute({ productId: 'p2', type: 'EGRESO', quantity: 1 }),
    ]);

    expect(order).toEqual(['p2', 'p1']);
  });
});
