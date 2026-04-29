import type { Supplier } from '@/domain/entities/Supplier';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';

/**
 * Repository Implementation — InMemorySupplierRepository
 */
export class InMemorySupplierRepository implements ISupplierRepository {
  private readonly store = new Map<string, Supplier>();

  async findById(id: string): Promise<Supplier | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Supplier[]> {
    return Array.from(this.store.values());
  }

  async save(supplier: Supplier): Promise<void> {
    if (this.store.has(supplier.id)) {
      throw new Error(`Supplier with ID "${supplier.id}" already exists`);
    }
    this.store.set(supplier.id, supplier);
  }

  async update(supplier: Supplier): Promise<void> {
    if (!this.store.has(supplier.id)) {
      throw new Error(`Supplier with ID "${supplier.id}" not found for update`);
    }
    this.store.set(supplier.id, supplier);
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) {
      throw new Error(`Supplier with ID "${id}" not found for deletion`);
    }
    this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }
}
