/**
 * DTOs for the Product resource.
 * These are plain data objects — no domain types escape this boundary.
 */

export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  description: string;
  unitPriceAmount: number;
  unitPriceCurrency: string;
  stockQuantity: number;
  reorderThreshold: number;
  needsReorder: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  unitPriceAmount: number;
  unitPriceCurrency: string;
  initialStockQuantity: number;
  reorderThreshold: number;
}

export interface UpdateProductDTO {
  id: string;
  name: string;
  description?: string;
  unitPriceAmount: number;
  unitPriceCurrency: string;
  reorderThreshold: number;
}

export interface AdjustStockDTO {
  productId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  quantity: number;
  unitCostAmount: number;
  unitCostCurrency: string;
  reason: string;
  reference?: string;
}

export interface GetProductByIdDTO {
  id: string;
}

export interface GetProductBySkuDTO {
  sku: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface ListProductsQueryDTO {
  page?: number;
  pageSize?: number;
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProductsDTO {
  items: ProductDTO[];
  pagination: PaginationMetaDTO;
}
