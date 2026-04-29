import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import { StockValuationService } from '@/domain/services/StockValuationService';

import type { WarehouseValuationDTO } from '../../dtos/ValuationDTO';

export interface GetWarehouseValuationDTO {
  currency: string;
}

/**
 * Use Case — GetWarehouseValuationUseCase
 *
 * Computes the total monetary value of all stock in the warehouse.
 * Delegates the calculation to the domain's StockValuationService.
 */
export class GetWarehouseValuationUseCase {
  private readonly valuationService = new StockValuationService();

  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetWarehouseValuationDTO): Promise<WarehouseValuationDTO> {
    const products = await this.productRepository.findAll();
    const result = this.valuationService.calculateWarehouseValue(products, dto.currency);

    return {
      lines: result.lines.map((line) => ({
        productId: line.productId,
        productName: line.productName,
        stockQuantity: line.stockQuantity,
        unitPriceAmount: line.unitPrice.amount,
        totalValueAmount: line.totalValue.amount,
        currency: result.currency,
      })),
      grandTotalAmount: result.grandTotal.amount,
      currency: result.currency,
      generatedAt: new Date().toISOString(),
    };
  }
}
