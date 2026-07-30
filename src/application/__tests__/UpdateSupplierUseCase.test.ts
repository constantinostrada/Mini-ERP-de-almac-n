import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemorySupplierRepository } from '@/infrastructure/repositories/InMemorySupplierRepository';

import { CreateSupplierUseCase } from '../use-cases/supplier/CreateSupplierUseCase';
import { UpdateSupplierUseCase } from '../use-cases/supplier/UpdateSupplierUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 'fixed-id';
  }
}

describe('UpdateSupplierUseCase', () => {
  let repo: InMemorySupplierRepository;
  let createUseCase: CreateSupplierUseCase;
  let updateUseCase: UpdateSupplierUseCase;

  beforeEach(() => {
    repo = new InMemorySupplierRepository();
    createUseCase = new CreateSupplierUseCase(repo, new FixedIdGenerator());
    updateUseCase = new UpdateSupplierUseCase(repo);
  });

  const seed = () =>
    createUseCase.execute({
      name: 'Original',
      contactEmail: 'original@proveedor.com',
      contactPhone: '+34 600 000 000',
      address: 'Calle Mayor 1',
    });

  it('updates name and contact info', async () => {
    await seed();

    const updated = await updateUseCase.execute({
      id: 'fixed-id',
      name: 'Renombrado',
      contactEmail: 'Nuevo@Proveedor.com',
      contactPhone: '+34 611 111 111',
      address: 'Avenida Nueva 42',
    });

    expect(updated.name).toBe('Renombrado');
    expect(updated.contactEmail).toBe('nuevo@proveedor.com');
    expect(updated.contactPhone).toBe('+34 611 111 111');
    expect(updated.address).toBe('Avenida Nueva 42');
  });

  it('persists the change in the repository', async () => {
    await seed();

    await updateUseCase.execute({
      id: 'fixed-id',
      name: 'Renombrado',
      contactEmail: 'nuevo@proveedor.com',
      contactPhone: '+34 611 111 111',
      address: 'Avenida Nueva 42',
    });

    const stored = await repo.findById('fixed-id');
    expect(stored?.name).toBe('Renombrado');
    expect(stored?.contactEmail).toBe('nuevo@proveedor.com');
  });

  it('throws SupplierNotFoundException when id is unknown', async () => {
    await expect(
      updateUseCase.execute({
        id: 'no-such-id',
        name: 'irrelevant',
        contactEmail: 'irrelevant@proveedor.com',
        contactPhone: '',
        address: '',
      }),
    ).rejects.toThrow(SupplierNotFoundException);
  });

  it('rejects an update with a name shorter than 2 characters', async () => {
    await seed();

    await expect(
      updateUseCase.execute({
        id: 'fixed-id',
        name: 'X',
        contactEmail: 'original@proveedor.com',
        contactPhone: '+34 600 000 000',
        address: 'Calle Mayor 1',
      }),
    ).rejects.toThrow(/at least 2 characters/);
  });

  it('rejects an update with an invalid contact email', async () => {
    await seed();

    await expect(
      updateUseCase.execute({
        id: 'fixed-id',
        name: 'Original',
        contactEmail: 'not-an-email',
        contactPhone: '+34 600 000 000',
        address: 'Calle Mayor 1',
      }),
    ).rejects.toThrow(/Invalid supplier contact email/);
  });
});
