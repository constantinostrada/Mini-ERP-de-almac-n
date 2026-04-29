import type { Supplier } from '../entities/Supplier';

/**
 * Repository Interface — ISupplierRepository
 *
 * Defines the persistence contract for warehouse suppliers.
 */
export interface ISupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
  save(supplier: Supplier): Promise<void>;
  update(supplier: Supplier): Promise<void>;
  delete(id: string): Promise<void>;
}
