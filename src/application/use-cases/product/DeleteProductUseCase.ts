import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import { ProductId } from '@/domain/value-objects/ProductId';

import type { GetProductByIdDTO } from '../../dtos/ProductDTO';

/**
 * Use Case — DeleteProductUseCase
 *
 * Removes a product from the warehouse catalog.
 */
export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetProductByIdDTO): Promise<void> {
    const productId = ProductId.create(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    await this.productRepository.delete(productId);
  }
}
