import { InvalidQueryParamException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';

import type {
  GetOverstockedProductsDTO,
  OverstockedProductDTO,
} from '../../dtos/ReportDTO';

const DEFAULT_RATIO = 2;

/**
 * Use Case — GetOverstockedProductsUseCase
 *
 * Returns products whose current stock is at or above `ratio × min_stock`.
 * Default ratio is 2 (i.e. products with double or more of their reorder threshold).
 * Products with min_stock = 0 are excluded (excess_ratio is undefined for them).
 *
 * Output is ordered by excess_ratio descending so the most overstocked items
 * appear first.
 */
export class GetOverstockedProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(dto: GetOverstockedProductsDTO): Promise<OverstockedProductDTO[]> {
    const ratio = this.resolveRatio(dto.ratio);

    const products = await this.productRepository.findAll();

    const candidates = products.filter((p) => {
      const min = p.reorderThreshold.value;
      const current = p.stockQuantity.value;
      return min > 0 && current >= ratio * min;
    });

    const rows: OverstockedProductDTO[] = await Promise.all(
      candidates.map(async (p) => {
        const lastMovement = await this.stockMovementRepository.findLastByProductId(p.id);
        const min = p.reorderThreshold.value;
        const current = p.stockQuantity.value;
        return {
          sku: p.sku.value,
          name: p.name,
          current_stock: current,
          min_stock: min,
          excess_ratio: current / min,
          last_movement_at: lastMovement ? lastMovement.occurredAt.toISOString() : null,
        };
      }),
    );

    rows.sort((a, b) => b.excess_ratio - a.excess_ratio);
    return rows;
  }

  private resolveRatio(input: number | undefined): number {
    if (input === undefined) {
      return DEFAULT_RATIO;
    }
    if (typeof input !== 'number' || !Number.isFinite(input)) {
      throw new InvalidQueryParamException('ratio', 'must be a finite number');
    }
    if (input < 1) {
      throw new InvalidQueryParamException('ratio', 'must be greater than or equal to 1');
    }
    return input;
  }
}
