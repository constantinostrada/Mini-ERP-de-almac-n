/**
 * DTO — IdleProductDTO
 *
 * One row in the "productos ociosos" report (no recent stock movements).
 *
 * `last_movement_at` and `days_since_last_movement` are null for products
 * that have never had a movement registered.
 */
export interface IdleProductDTO {
  sku: string;
  name: string;
  current_stock: number;
  last_movement_at: string | null;
  days_since_last_movement: number | null;
}

export interface GetIdleProductsDTO {
  /** Threshold in days. Products idle for more than this many days are returned. */
  days: number;
  /** When true, products that never had a movement are included with null fields. */
  includeNeverMoved?: boolean;
}
