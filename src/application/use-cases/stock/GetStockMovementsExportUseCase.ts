import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';

import type { StockMovementExportRowDTO } from '../../dtos/StockMovementExportDTO';
import { StockMovementExportMapper } from '../../mappers/StockMovementExportMapper';

/**
 * Use Case — GetStockMovementsExportUseCase
 *
 * Returns every stock movement in the warehouse joined with its product's
 * name and SKU, ordered newest-first, annotating each movement with the
 * stock level that resulted from it. As with the per-product history, the
 * resulting stock is reconstructed by walking back from the product's
 * current stock so it stays correct for products created with a non-zero
 * initial stock.
 *
 * Returns plain data rows only — output formatting (e.g. CSV) belongs to
 * the interfaces layer.
 */
export class GetStockMovementsExportUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(): Promise<StockMovementExportRowDTO[]> {
    const products = await this.productRepository.findAll();
    const rows: StockMovementExportRowDTO[] = [];

    for (const product of products) {
      // Repository contract: movements come ordered by date descending
      const movements = await this.stockMovementRepository.findByProductId(product.id);

      let stockAfter = product.stockQuantity.value;
      for (const movement of movements) {
        rows.push(StockMovementExportMapper.toDTO(movement, product, stockAfter));
        stockAfter -= movement.stockDelta;
      }
    }

    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
}
