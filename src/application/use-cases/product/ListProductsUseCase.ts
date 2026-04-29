import type { IProductRepository } from '@/domain/repositories/IProductRepository';

import type { ProductDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

/**
 * Use Case — ListProductsUseCase
 *
 * Returns the full product catalog from the warehouse.
 */
export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductDTO[]> {
    const products = await this.productRepository.findAll();
    return ProductMapper.toDTOList(products);
  }
}
