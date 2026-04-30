import type { StockMovement } from '@/domain/entities/StockMovement';

import type { StockMovementDTO } from '../dtos/StockMovementDTO';

export class StockMovementMapper {
  static toDTO(movement: StockMovement): StockMovementDTO {
    return {
      id: movement.id,
      productId: movement.productId.value,
      type: movement.type,
      quantity: movement.quantity.value,
      unitCostAmount: movement.unitCost?.amount,
      unitCostCurrency: movement.unitCost?.currency,
      totalCostAmount: movement.totalCost?.amount,
      reason: movement.reason,
      reference: movement.reference,
      occurredAt: movement.occurredAt.toISOString(),
    };
  }

  static toDTOList(movements: StockMovement[]): StockMovementDTO[] {
    return movements.map(StockMovementMapper.toDTO);
  }
}
