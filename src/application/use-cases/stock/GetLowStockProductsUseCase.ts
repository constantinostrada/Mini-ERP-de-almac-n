import type { IProductRepository } from '@/domain/repositories/IProductRepository';

import type { ProductDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

/**
 * Use Case — GetLowStockProductsUseCase
 *
 * Returns all products whose current stock is at or below their reorder threshold.
 * Useful for generating purchase order alerts.
 */
export class GetLowStockProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductDTO[]> {
    const products = await this.productRepository.findBelowReorderThreshold();
    return ProductMapper.toDTOList(products);
  }
}
