import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase';
import { GetProductByIdUseCase } from '../use-cases/product/GetProductByIdUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 'p-1';
  }
}

describe('GetProductByIdUseCase', () => {
  let repo: InMemoryProductRepository;
  let createUseCase: CreateProductUseCase;
  let getUseCase: GetProductByIdUseCase;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    createUseCase = new CreateProductUseCase(repo, new FixedIdGenerator());
    getUseCase = new GetProductByIdUseCase(repo);
  });

  it('returns the DTO for an existing product', async () => {
    await createUseCase.execute({
      sku: 'GET-001',
      name: 'Producto',
      unitPriceAmount: 2.5,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 2,
    });

    const dto = await getUseCase.execute({ id: 'p-1' });
    expect(dto.id).toBe('p-1');
    expect(dto.sku).toBe('GET-001');
  });

  it('throws ProductNotFoundException for unknown id', async () => {
    await expect(getUseCase.execute({ id: 'no-such-id' })).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
