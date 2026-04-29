import type { MovementType } from '@/domain/entities/StockMovement';

export interface StockMovementDTO {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  unitCostAmount: number;
  unitCostCurrency: string;
  totalCostAmount: number;
  reason: string;
  reference?: string;
  occurredAt: string; // ISO 8601
}

export interface GetMovementsByProductDTO {
  productId: string;
}

export interface GetMovementsByDateRangeDTO {
  from: string; // ISO 8601
  to: string;   // ISO 8601
}
