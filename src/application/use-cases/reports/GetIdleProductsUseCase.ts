import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';

import type { GetIdleProductsDTO, IdleProductDTO } from '../../dtos/IdleProductDTO';

const MS_PER_DAY = 86_400_000;

/**
 * Use Case — GetIdleProductsUseCase
 *
 * Reports products with no stock movements in the last N days. Optionally
 * includes products that never had a movement registered (with null fields).
 *
 * Result is sorted by days_since_last_movement descending (most idle first);
 * never-moved products are treated as the most idle and surface at the top.
 */
export class GetIdleProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(dto: GetIdleProductsDTO): Promise<IdleProductDTO[]> {
    if (!Number.isFinite(dto.days) || dto.days < 0) {
      throw new Error('days must be a non-negative number');
    }

    const includeNeverMoved = dto.includeNeverMoved === true;
    const now = Date.now();
    const products = await this.productRepository.findAll();

    const rows: IdleProductDTO[] = [];

    for (const product of products) {
      const movements = await this.stockMovementRepository.findByProductId(product.id);
      const latest = movements[0];

      if (!latest) {
        if (!includeNeverMoved) continue;
        rows.push({
          sku: product.sku.value,
          name: product.name,
          current_stock: product.stockQuantity.value,
          last_movement_at: null,
          days_since_last_movement: null,
        });
        continue;
      }

      const daysSince = Math.floor((now - latest.occurredAt.getTime()) / MS_PER_DAY);
      if (daysSince <= dto.days) continue;

      rows.push({
        sku: product.sku.value,
        name: product.name,
        current_stock: product.stockQuantity.value,
        last_movement_at: latest.occurredAt.toISOString(),
        days_since_last_movement: daysSince,
      });
    }

    rows.sort((a, b) => {
      const av = a.days_since_last_movement ?? Number.POSITIVE_INFINITY;
      const bv = b.days_since_last_movement ?? Number.POSITIVE_INFINITY;
      return bv - av;
    });

    return rows;
  }
}
