/**
 * DTOs for the warehouse reporting endpoints.
 */

export interface OverstockedProductDTO {
  sku: string;
  name: string;
  current_stock: number;
  min_stock: number;
  excess_ratio: number;
  last_movement_at: string | null; // ISO 8601, null if no movements recorded
}

export interface GetOverstockedProductsDTO {
  ratio?: number;
}
