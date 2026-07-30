import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

import type { GetSupplierByIdDTO, SupplierDTO } from '../../dtos/SupplierDTO';
import { SupplierMapper } from '../../mappers/SupplierMapper';

/**
 * Use Case — GetSupplierByIdUseCase
 *
 * Retrieves a single supplier by its unique ID.
 * Throws SupplierNotFoundException if the supplier does not exist.
 */
export class GetSupplierByIdUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async execute(dto: GetSupplierByIdDTO): Promise<SupplierDTO> {
    const supplier = await this.supplierRepository.findById(dto.id);

    if (!supplier) {
      throw new SupplierNotFoundException(dto.id);
    }

    return SupplierMapper.toDTO(supplier);
  }
}
