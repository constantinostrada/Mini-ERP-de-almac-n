import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemoryProductRepository } from '@/infrastructure/repositories/InMemoryProductRepository';

import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase';
import { UpdateProductUseCase } from '../use-cases/product/UpdateProductUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 'fixed-id';
  }
}

describe('UpdateProductUseCase', () => {
  let repo: InMemoryProductRepository;
  let createUseCase: CreateProductUseCase;
  let updateUseCase: UpdateProductUseCase;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
    createUseCase = new CreateProductUseCase(repo, new FixedIdGenerator());
    updateUseCase = new UpdateProductUseCase(repo);
  });

  it('updates name, description, unit price, and reorder threshold (min_stock)', async () => {
    await createUseCase.execute({
      sku: 'UP-001',
      name: 'Original',
      description: 'desc original',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 2,
    });

    const updated = await updateUseCase.execute({
      id: 'fixed-id',
      name: 'Renombrado',
      description: 'nueva desc',
      unitPriceAmount: 5.55,
      unitPriceCurrency: 'EUR',
      reorderThreshold: 99,
    });

    expect(updated.name).toBe('Renombrado');
    expect(updated.description).toBe('nueva desc');
    expect(updated.unitPriceAmount).toBe(5.55);
    expect(updated.reorderThreshold).toBe(99);
  });

  it('throws ProductNotFoundException when id is unknown', async () => {
    await expect(
      updateUseCase.execute({
        id: 'no-such-id',
        name: 'irrelevant',
        description: '',
        unitPriceAmount: 1,
        unitPriceCurrency: 'EUR',
        reorderThreshold: 0,
      }),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('rejects update when reorderThreshold is negative (Quantity invariant)', async () => {
    await createUseCase.execute({
      sku: 'UP-002',
      name: 'Producto',
      unitPriceAmount: 1,
      unitPriceCurrency: 'EUR',
      initialStockQuantity: 10,
      reorderThreshold: 1,
    });

    await expect(
      updateUseCase.execute({
        id: 'fixed-id',
        name: 'Producto',
        unitPriceAmount: 1,
        unitPriceCurrency: 'EUR',
        reorderThreshold: -1,
      }),
    ).rejects.toThrow(/cannot be negative/);
  });
});
