import { Supplier } from '@/domain/entities/Supplier';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

import type { CreateSupplierDTO, SupplierDTO } from '../../dtos/SupplierDTO';
import { SupplierMapper } from '../../mappers/SupplierMapper';
import type { IIdGenerator } from '../../ports/IIdGenerator';

/**
 * Use Case — CreateSupplierUseCase
 *
 * Registers a new supplier in the system.
 */
export class CreateSupplierUseCase {
  constructor(
    private readonly supplierRepository: ISupplierRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: CreateSupplierDTO): Promise<SupplierDTO> {
    const supplier = Supplier.create({
      id: this.idGenerator.generate(),
      name: dto.name,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      address: dto.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.supplierRepository.save(supplier);

    return SupplierMapper.toDTO(supplier);
  }
}
