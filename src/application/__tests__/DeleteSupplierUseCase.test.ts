import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemorySupplierRepository } from '@/infrastructure/repositories/InMemorySupplierRepository';

import { CreateSupplierUseCase } from '../use-cases/supplier/CreateSupplierUseCase';
import { DeleteSupplierUseCase } from '../use-cases/supplier/DeleteSupplierUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 's-1';
  }
}

describe('DeleteSupplierUseCase', () => {
  let repo: InMemorySupplierRepository;
  let createUseCase: CreateSupplierUseCase;
  let deleteUseCase: DeleteSupplierUseCase;

  beforeEach(() => {
    repo = new InMemorySupplierRepository();
    createUseCase = new CreateSupplierUseCase(repo, new FixedIdGenerator());
    deleteUseCase = new DeleteSupplierUseCase(repo);
  });

  it('removes an existing supplier', async () => {
    await createUseCase.execute({
      name: 'Proveedor Uno',
      contactEmail: 'contacto@proveedor.com',
      contactPhone: '+34 600 000 000',
      address: 'Calle Mayor 1',
    });
    expect(await repo.findAll()).toHaveLength(1);

    await deleteUseCase.execute({ id: 's-1' });
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('throws SupplierNotFoundException for unknown id', async () => {
    await expect(deleteUseCase.execute({ id: 'missing' })).rejects.toThrow(
      SupplierNotFoundException,
    );
  });
});
