import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase';
import { ListProductsUseCase } from '../use-cases/product/ListProductsUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class CounterIdGenerator implements IIdGenerator {
  private n = 0;
  generate(): string {
    return `p-${++this.n}`;
  }
}

describe('ListProductsUseCase', () => {
  it('returns all products as DTOs', async () => {
    const repo = new InMemoryProductRepository();
    const create = new CreateProductUseCase(repo, new CounterIdGenerator());
    const list = new ListProductsUseCase(repo);

    await create.execute({
      sku: 'L-001',
      name: 'Uno',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 5,
      reorderThreshold: 1,
    });
    await create.execute({
      sku: 'L-002',
      name: 'Dos',
      unitPriceAmount: 2,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 2,
    });

    const dtos = await list.execute();
    expect(dtos).toHaveLength(2);
    expect(dtos.map((d) => d.sku).sort()).toEqual(['L-001', 'L-002']);
  });

  it('returns an empty array when no products exist', async () => {
    const list = new ListProductsUseCase(new InMemoryProductRepository());
    expect(await list.execute()).toEqual([]);
  });
});
