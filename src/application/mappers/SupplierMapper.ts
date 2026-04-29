import type { Supplier } from '@/domain/entities/Supplier';

import type { SupplierDTO } from '../dtos/SupplierDTO';

export class SupplierMapper {
  static toDTO(supplier: Supplier): SupplierDTO {
    return {
      id: supplier.id,
      name: supplier.name,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      address: supplier.address,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
    };
  }

  static toDTOList(suppliers: Supplier[]): SupplierDTO[] {
    return suppliers.map(SupplierMapper.toDTO);
  }
}
