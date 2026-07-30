import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import { InMemorySupplierRepository } from '@/infrastructure/repositories/InMemorySupplierRepository';

import { CreateSupplierUseCase } from '../use-cases/supplier/CreateSupplierUseCase';
import { GetSupplierByIdUseCase } from '../use-cases/supplier/GetSupplierByIdUseCase';
import type { IIdGenerator } from '../ports/IIdGenerator';

class FixedIdGenerator implements IIdGenerator {
  generate(): string {
    return 's-1';
  }
}

describe('GetSupplierByIdUseCase', () => {
  let repo: InMemorySupplierRepository;
  let createUseCase: CreateSupplierUseCase;
  let getUseCase: GetSupplierByIdUseCase;

  beforeEach(() => {
    repo = new InMemorySupplierRepository();
    createUseCase = new CreateSupplierUseCase(repo, new FixedIdGenerator());
    getUseCase = new GetSupplierByIdUseCase(repo);
  });

  it('returns the DTO for an existing supplier', async () => {
    await createUseCase.execute({
      name: 'Proveedor Uno',
      contactEmail: 'Contacto@Proveedor.com',
      contactPhone: '+34 600 000 000',
      address: 'Calle Mayor 1',
    });

    const dto = await getUseCase.execute({ id: 's-1' });

    expect(dto.id).toBe('s-1');
    expect(dto.name).toBe('Proveedor Uno');
    expect(dto.contactEmail).toBe('contacto@proveedor.com');
    expect(dto.address).toBe('Calle Mayor 1');
  });

  it('throws SupplierNotFoundException for unknown id', async () => {
    await expect(getUseCase.execute({ id: 'no-such-id' })).rejects.toThrow(
      SupplierNotFoundException,
    );
  });
});
