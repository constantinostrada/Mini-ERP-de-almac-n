export interface ProductValuationLineDTO {
  productId: string;
  productName: string;
  stockQuantity: number;
  unitPriceAmount: number;
  totalValueAmount: number;
  currency: string;
}

export interface WarehouseValuationDTO {
  lines: ProductValuationLineDTO[];
  grandTotalAmount: number;
  currency: string;
  generatedAt: string; // ISO 8601
}
