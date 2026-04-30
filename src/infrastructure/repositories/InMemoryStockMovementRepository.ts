import type { StockMovement } from '@/domain/entities/StockMovement';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import type { ProductId } from '@/domain/value-objects/ProductId';

/**
 * Repository Implementation — InMemoryStockMovementRepository
 *
 * Stores stock movement audit records in memory.
 */
export class InMemoryStockMovementRepository implements IStockMovementRepository {
  private readonly store = new Map<string, StockMovement>();

  async save(movement: StockMovement): Promise<void> {
    this.store.set(movement.id, movement);
  }

  async findByProductId(productId: ProductId): Promise<StockMovement[]> {
    return Array.from(this.store.values())
      .filter((m) => m.productId.equals(productId))
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async findLastByProductId(productId: ProductId): Promise<StockMovement | null> {
    const movements = await this.findByProductId(productId);
    return movements[0] ?? null;
  }

  async findByDateRange(from: Date, to: Date): Promise<StockMovement[]> {
    return Array.from(this.store.values())
      .filter((m) => m.occurredAt >= from && m.occurredAt <= to)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async countByType(
    productId: ProductId,
  ): Promise<{ inbound: number; outbound: number; adjustment: number }> {
    const movements = await this.findByProductId(productId);
    return {
      inbound: movements.filter((m) => m.type === 'INBOUND').length,
      outbound: movements.filter((m) => m.type === 'OUTBOUND').length,
      adjustment: movements.filter((m) => m.type === 'ADJUSTMENT').length,
    };
  }

  clear(): void {
    this.store.clear();
  }
}
