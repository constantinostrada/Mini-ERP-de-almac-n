import type { StockMovement } from '../entities/StockMovement';
import type { ProductId } from '../value-objects/ProductId';

/**
 * Repository Interface — IStockMovementRepository
 *
 * Defines the persistence contract for stock movement audit records.
 */
export interface IStockMovementRepository {
  /** Persist a new stock movement record. */
  save(movement: StockMovement): Promise<void>;

  /** Retrieve all movements for a given product, ordered by date descending. */
  findByProductId(productId: ProductId): Promise<StockMovement[]>;

  /** Retrieve all movements within a date range. */
  findByDateRange(from: Date, to: Date): Promise<StockMovement[]>;

  /** Count movements by type for a specific product. */
  countByType(
    productId: ProductId,
  ): Promise<{ inbound: number; outbound: number; adjustment: number }>;
}
