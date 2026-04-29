import type { Product } from '../entities/Product';
import type { ProductId } from '../value-objects/ProductId';
import type { SKU } from '../value-objects/SKU';

/**
 * Repository Interface — IProductRepository
 *
 * Describes WHAT persistence operations exist for products.
 * HOW they are implemented lives in infrastructure/.
 */
export interface IProductRepository {
  /** Retrieve a product by its unique ID. Returns null if not found. */
  findById(id: ProductId): Promise<Product | null>;

  /** Retrieve a product by its SKU. Returns null if not found. */
  findBySku(sku: SKU): Promise<Product | null>;

  /** Retrieve all products, optionally filtered. */
  findAll(): Promise<Product[]>;

  /** Retrieve all products whose stock is at or below their reorder threshold. */
  findBelowReorderThreshold(): Promise<Product[]>;

  /** Persist a new product. Throws if SKU already exists. */
  save(product: Product): Promise<void>;

  /** Persist changes to an existing product. Throws if not found. */
  update(product: Product): Promise<void>;

  /** Remove a product by ID. Throws if not found. */
  delete(id: ProductId): Promise<void>;

  /** Check whether a product with the given SKU already exists. */
  existsBySku(sku: SKU): Promise<boolean>;
}
