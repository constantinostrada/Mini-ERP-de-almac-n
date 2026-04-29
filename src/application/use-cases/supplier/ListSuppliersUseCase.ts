import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

import type { SupplierDTO } from '../../dtos/SupplierDTO';
import { SupplierMapper } from '../../mappers/SupplierMapper';

/**
 * Use Case — ListSuppliersUseCase
 *
 * Returns all suppliers registered in the system.
 */
export class ListSuppliersUseCase {
  constructor(private readonly supplierRepository: ISupplierRepository) {}

  async execute(): Promise<SupplierDTO[]> {
    const suppliers = await this.supplierRepository.findAll();
    return SupplierMapper.toDTOList(suppliers);
  }
}
