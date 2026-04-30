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

    const result = await list.execute();
    expect(result.items).toHaveLength(2);
    expect(result.items.map((d) => d.sku).sort()).toEqual(['L-001', 'L-002']);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 2,
      totalPages: 1,
    });
  });

  it('returns an empty page with total=0 when no products exist', async () => {
    const list = new ListProductsUseCase(new InMemoryProductRepository());
    const result = await list.execute();
    expect(result.items).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    });
  });

  describe('pagination', () => {
    async function seed25(): Promise<ListProductsUseCase> {
      const repo = new InMemoryProductRepository();
      const create = new CreateProductUseCase(repo, new CounterIdGenerator());
      for (let i = 1; i <= 25; i++) {
        await create.execute({
          sku: `PAG-${String(i).padStart(3, '0')}`,
          name: `Producto ${i}`,
          unitPriceAmount: i,
          unitPriceCurrency: 'EUR',
          initialStockQuantity: i,
          reorderThreshold: 1,
        });
      }
      return new ListProductsUseCase(repo);
    }

    it('paginates 25 products: page 1 returns the first pageSize items and total reflects the count', async () => {
      const list = await seed25();
      const page1 = await list.execute({ page: 1, pageSize: 20 });
      expect(page1.items).toHaveLength(20);
      expect(page1.pagination).toEqual({
        page: 1,
        pageSize: 20,
        total: 25,
        totalPages: 2,
      });
    });

    it('paginates 25 products: page 2 returns the remaining items', async () => {
      const list = await seed25();
      const page1 = await list.execute({ page: 1, pageSize: 20 });
      const page2 = await list.execute({ page: 2, pageSize: 20 });
      expect(page2.items).toHaveLength(5);
      expect(page2.pagination).toEqual({
        page: 2,
        pageSize: 20,
        total: 25,
        totalPages: 2,
      });
      const page1Skus = new Set(page1.items.map((p) => p.sku));
      for (const item of page2.items) {
        expect(page1Skus.has(item.sku)).toBe(false);
      }
    });

    it('clamps page to >= 1 and pageSize to [1, 100]', async () => {
      const list = await seed25();
      const negativePage = await list.execute({ page: -3, pageSize: 10 });
      expect(negativePage.pagination.page).toBe(1);

      const tooBigPageSize = await list.execute({ page: 1, pageSize: 9999 });
      expect(tooBigPageSize.pagination.pageSize).toBe(100);
      expect(tooBigPageSize.items).toHaveLength(25);

      const tooSmallPageSize = await list.execute({ page: 1, pageSize: 0 });
      expect(tooSmallPageSize.pagination.pageSize).toBe(1);
      expect(tooSmallPageSize.items).toHaveLength(1);
    });
  });
});
