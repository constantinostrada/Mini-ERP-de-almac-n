import { SupplierNotFoundException } from '@/domain/exceptions/DomainException';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

import type { GetSupplierByIdDTO } from '../../dtos/SupplierDTO';

/**
 * Use Case — DeleteSupplierUseCase
 *
 * Removes a supplier from the system.
 */
export class DeleteSupplierUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async execute(dto: GetSupplierByIdDTO): Promise<void> {
    const supplier = await this.supplierRepository.findById(dto.id);

    if (!supplier) {
      throw new SupplierNotFoundException(dto.id);
    }

    await this.supplierRepository.delete(dto.id);
  }
}
