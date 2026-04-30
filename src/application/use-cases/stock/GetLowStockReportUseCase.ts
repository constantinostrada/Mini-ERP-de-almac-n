import type { Product } from '@/domain/entities/Product';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';

import type {
  GetLowStockReportDTO,
  LowStockReportLineDTO,
} from '../../dtos/LowStockReportDTO';

/**
 * Use Case — GetLowStockReportUseCase
 *
 * Builds the low-stock report. By default, it returns every product whose
 * current stock is at or below its reorder threshold (min_stock). When the
 * caller passes a `thresholdPct`, products whose stock sits within an
 * `(1 + thresholdPct/100) × min_stock` buffer are ALSO included as an
 * "early alert" so reorder decisions can be made before stock-outs occur.
 *
 * Results are sorted by deficit (min_stock - current_stock) descending so
 * the most critical items appear first.
 */
export class GetLowStockReportUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(dto: GetLowStockReportDTO = {}): Promise<LowStockReportLineDTO[]> {
    const thresholdPct = this.normalizeThreshold(dto.thresholdPct);

    const products = await this.productRepository.findAll();
    const matched = products.filter((p) => this.qualifies(p, thresholdPct));

    matched.sort((a, b) => this.deficit(b) - this.deficit(a));

    return Promise.all(matched.map((p) => this.toLine(p)));
  }

  private qualifies(product: Product, thresholdPct: number | undefined): boolean {
    const stock = product.stockQuantity.value;
    const minStock = product.reorderThreshold.value;

    if (stock <= minStock) {
      return true;
    }
    if (thresholdPct !== undefined) {
      const earlyAlertCeiling = minStock * (1 + thresholdPct / 100);
      return stock <= earlyAlertCeiling;
    }
    return false;
  }

  private deficit(product: Product): number {
    return product.reorderThreshold.value - product.stockQuantity.value;
  }

  private async toLine(product: Product): Promise<LowStockReportLineDTO> {
    const movements = await this.stockMovementRepository.findByProductId(product.id);
    const lastMovement = movements[0];

    return {
      sku: product.sku.value,
      name: product.name,
      current_stock: product.stockQuantity.value,
      min_stock: product.reorderThreshold.value,
      deficit: this.deficit(product),
      last_movement_at: lastMovement ? lastMovement.occurredAt.toISOString() : null,
    };
  }

  private normalizeThreshold(value: number | undefined): number | undefined {
    if (value === undefined) return undefined;
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`thresholdPct must be a non-negative number, received: ${value}`);
    }
    return value;
  }
}
