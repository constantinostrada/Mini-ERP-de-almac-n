import type { MovementType } from '@/domain/entities/StockMovement';

export interface StockMovementDTO {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  unitCostAmount?: number;
  unitCostCurrency?: string;
  totalCostAmount?: number;
  reason?: string;
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

/**
 * Public-facing movement type used by the /movements endpoint.
 * Maps to internal INBOUND / OUTBOUND domain types.
 */
export type PublicMovementType = 'INGRESO' | 'EGRESO';

export interface MoneyDTO {
  amount: number;
  currency: string;
}

export interface RegisterMovementDTO {
  productId: string;
  type: PublicMovementType;
  quantity: number;
  reason?: string;
  unitCost?: MoneyDTO;
}

export interface PublicStockMovementDTO {
  id: string;
  product_id: string;
  type: PublicMovementType;
  quantity: number;
  reason?: string;
  unit_cost?: MoneyDTO | null;
  created_at: string; // ISO 8601
}
