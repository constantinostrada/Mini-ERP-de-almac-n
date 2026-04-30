/**
 * DTOs for the low-stock report.
 * Field names are snake_case to match the contract documented for the
 * GET /reports/low-stock endpoint response.
 */

export interface LowStockReportLineDTO {
  sku: string;
  name: string;
  current_stock: number;
  min_stock: number;
  /**
   * min_stock - current_stock. Positive for products at/below min_stock
   * (real shortage). Negative for products surfaced only by the early-alert
   * threshold (current_stock still above min_stock but within the buffer).
   */
  deficit: number;
  /** ISO 8601 timestamp of the most recent stock movement, or null. */
  last_movement_at: string | null;
}

export interface GetLowStockReportDTO {
  /**
   * Optional early-alert percentage. When provided, products whose stock is
   * within (1 + thresholdPct / 100) × min_stock are also included in the
   * report, in addition to those already at or below min_stock.
   */
  thresholdPct?: number;
}
