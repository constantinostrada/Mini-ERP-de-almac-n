import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { ISupplierRepository } from '@/domain/repositories/ISupplierRepository';
import { StockValuationService } from '@/domain/services/StockValuationService';

import type { SupplierValuationDTO } from '../../dtos/SupplierValuationDTO';

export interface GetSupplierValuationDTO {
  currency: string;
}

/**
 * Use Case — GetSupplierValuationUseCase
 *
 * Computes the inventory value grouped by supplier: for each supplier, the
 * number of products it provides, the units in stock and their total
 * monetary value. Delegates the calculation to the domain's
 * StockValuationService; products not assigned to any supplier are excluded.
 */
export class GetSupplierValuationUseCase {
  private readonly valuationService = new StockValuationService();

  constructor(
    private readonly supplierRepository: ISupplierRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: GetSupplierValuationDTO): Promise<SupplierValuationDTO> {
    const [suppliers, products] = await Promise.all([
      this.supplierRepository.findAll(),
      this.productRepository.findAll(),
    ]);

    const result = this.valuationService.calculateValueBySupplier(
      suppliers,
      products,
      dto.currency,
    );

    return {
      lines: result.map((line) => ({
        supplierId: line.supplierId,
        supplierName: line.supplierName,
        productCount: line.productCount,
        totalUnits: line.totalUnits,
        totalValueAmount: line.totalValue.amount,
        currency: line.totalValue.currency,
      })),
      currency: dto.currency,
      generatedAt: new Date().toISOString(),
    };
  }
}
