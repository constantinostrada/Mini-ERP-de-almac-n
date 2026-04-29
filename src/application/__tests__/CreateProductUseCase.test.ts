import { DuplicateSkuException } from '@/domain/exceptions/DomainException';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  private count = 0;
  generate(): string {
    return `id-${++this.count}`;
  }
}

describe('CreateProductUseCase', () => {
  let repo: InMemoryProductRepository;
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    useCase = new CreateProductUseCase(repo, new FixedIdGenerator());
  });

  it('creates a product and returns a DTO', async () => {
    const dto = await useCase.execute({
      sku: 'BOX-001',
      name: 'Caja pequeña',
      description: 'Caja de cartón 20x15x10 cm',
      unitPriceAmount: 1.5,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 100,
      reorderThreshold: 20,
    });

    expect(dto.id).toBe('id-1');
    expect(dto.sku).toBe('BOX-001');
    expect(dto.name).toBe('Caja pequeña');
    expect(dto.stockQuantity).toBe(100);
    expect(dto.needsReorder).toBe(false);
  });

  it('throws DuplicateSkuException if SKU already exists', async () => {
    const input = {
      sku: 'BOX-001',
      name: 'Caja pequeña',
      description: '',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 5,
    };

    await useCase.execute(input);
    await expect(useCase.execute(input)).rejects.toThrow(DuplicateSkuException);
  });
});
