/**
 * DTOs for the per-supplier inventory valuation endpoint
 * (GET /api/suppliers/valuation).
 */

export interface SupplierValuationLineDTO {
  supplierId: string;
  supplierName: string;
  productCount: number;
  totalUnits: number;
  totalValueAmount: number;
  currency: string;
}

export interface SupplierValuationDTO {
  lines: SupplierValuationLineDTO[];
  currency: string;
  generatedAt: string; // ISO 8601
}
