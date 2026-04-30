import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase';
import { DeleteProductUseCase } from '../use-cases/product/DeleteProductUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 'p-1';
  }
}

describe('DeleteProductUseCase', () => {
  let repo: InMemoryProductRepository;
  let createUseCase: CreateProductUseCase;
  let deleteUseCase: DeleteProductUseCase;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    createUseCase = new CreateProductUseCase(repo, new FixedIdGenerator());
    deleteUseCase = new DeleteProductUseCase(repo);
  });

  it('removes an existing product', async () => {
    await createUseCase.execute({
      sku: 'DEL-001',
      name: 'Producto',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 0,
      reorderThreshold: 0,
    });
    expect(await repo.findAll()).toHaveLength(1);

    await deleteUseCase.execute({ id: 'p-1' });
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('throws ProductNotFoundException for unknown id', async () => {
    await expect(deleteUseCase.execute({ id: 'missing' })).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
