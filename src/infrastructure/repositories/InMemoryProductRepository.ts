import type { Product } from '@/domain/entities/Product';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { ProductId } from '@/domain/value-objects/ProductId';
import type { SKU } from '@/domain/value-objects/SKU';

/**
 * Repository Implementation — InMemoryProductRepository
 *
 * Stores products in a Map keyed by product ID string.
 * Suitable for development, testing, and demo purposes.
 * Replace with a real database adapter (e.g. PostgreSQL via Prisma) for production.
 */
export class InMemoryProductRepository implements IProductRepository {
  private readonly store = new Map<string, Product>();

  async findById(id: ProductId): Promise<Product | null> {
    return this.store.get(id.value) ?? null;
  }

  async findBySku(sku: SKU): Promise<Product | null> {
    for (const product of this.store.values()) {
      if (product.sku.equals(sku)) {
        return product;
      }
    }
    return null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.store.values());
  }

  async findBelowReorderThreshold(): Promise<Product[]> {
    return Array.from(this.store.values()).filter((p) => p.needsReorder());
  }

  async save(product: Product): Promise<void> {
    if (this.store.has(product.id.value)) {
      throw new Error(`Product with ID "${product.id.value}" already exists`);
    }
    this.store.set(product.id.value, product);
  }

  async update(product: Product): Promise<void> {
    if (!this.store.has(product.id.value)) {
      throw new Error(`Product with ID "${product.id.value}" not found for update`);
    }
    this.store.set(product.id.value, product);
  }

  async delete(id: ProductId): Promise<void> {
    if (!this.store.has(id.value)) {
      throw new Error(`Product with ID "${id.value}" not found for deletion`);
    }
    this.store.delete(id.value);
  }

  async existsBySku(sku: SKU): Promise<boolean> {
    for (const product of this.store.values()) {
      if (product.sku.equals(sku)) return true;
    }
    return false;
  }

  /** Utility for tests: wipe all records. */
  clear(): void {
    this.store.clear();
  }

  /** Utility for tests: seed records directly. */
  seed(products: Product[]): void {
    for (const p of products) {
      this.store.set(p.id.value, p);
    }
  }
}
