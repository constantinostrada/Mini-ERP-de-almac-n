import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

import type { SupplierDTO, UpdateSupplierDTO } from '../../dtos/SupplierDTO';
import { SupplierMapper } from '../../mappers/SupplierMapper';

/**
 * Use Case — UpdateSupplierUseCase
 *
 * Updates a supplier's name and contact details.
 */
export class UpdateSupplierUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async execute(dto: UpdateSupplierDTO): Promise<SupplierDTO> {
    const supplier = await this.supplierRepository.findById(dto.id);

    if (!supplier) {
      throw new SupplierNotFoundException(dto.id);
    }

    supplier.updateName(dto.name);
    supplier.updateContactInfo(dto.contactEmail, dto.contactPhone, dto.address);

    await this.supplierRepository.update(supplier);

    return SupplierMapper.toDTO(supplier);
  }
}
