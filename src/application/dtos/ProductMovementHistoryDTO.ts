import type { MovementType } from '@/domain/entities/StockMovement';

/**
 * DTOs for the product movement history endpoint
 * (GET /api/products/:id/movements).
 */

export interface GetProductMovementHistoryDTO {
  productId: string;
}

export interface ProductMovementHistoryItemDTO {
  id: string;
  date: string; // ISO 8601
  type: MovementType;
  quantity: number;
  /** Stock level of the product right after this movement was applied. */
  resultingStock: number;
}
