import type { MovementType } from '@/domain/entities/StockMovement';

/**
 * DTOs for the warehouse-wide movement export endpoint
 * (GET /api/movements/export).
 *
 * The use case returns plain data rows; serialization to CSV (or any
 * other format) happens in the interfaces layer.
 */

export interface StockMovementExportRowDTO {
  date: string; // ISO 8601
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  /** Stock level of the product right after this movement was applied. */
  resultingStock: number;
}
