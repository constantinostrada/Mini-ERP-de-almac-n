import type { StockMovement } from '@/domain/entities/StockMovement';

import type { ProductMovementHistoryItemDTO } from '../dtos/ProductMovementHistoryDTO';

export class ProductMovementHistoryMapper {
  static toDTO(movement: StockMovement, resultingStock: number): ProductMovementHistoryItemDTO {
    return {
      id: movement.id,
      date: movement.occurredAt.toISOString(),
      type: movement.type,
      quantity: movement.quantity.value,
      resultingStock,
    };
  }
}
