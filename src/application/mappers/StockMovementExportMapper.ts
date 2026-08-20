import type { Product } from '@/domain/entities/Product';
import type { StockMovement } from '@/domain/entities/StockMovement';

import type { StockMovementExportRowDTO } from '../dtos/StockMovementExportDTO';

export class StockMovementExportMapper {
  static toDTO(
    movement: StockMovement,
    product: Product,
    resultingStock: number,
  ): StockMovementExportRowDTO {
    return {
      date: movement.occurredAt.toISOString(),
      productName: product.name,
      sku: product.sku.value,
      type: movement.type,
      quantity: movement.quantity.value,
      resultingStock,
    };
  }
}
