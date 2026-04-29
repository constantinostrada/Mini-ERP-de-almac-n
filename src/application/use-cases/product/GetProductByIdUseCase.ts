import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import { ProductId } from '@/domain/value-objects/ProductId';

import type { GetProductByIdDTO, ProductDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

/**
 * Use Case — GetProductByIdUseCase
 *
 * Retrieves a single product by its unique ID.
 * Throws ProductNotFoundException if the product does not exist.
 */
export class GetProductByIdUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: GetProductByIdDTO): Promise<ProductDTO> {
    const productId = ProductId.create(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    return ProductMapper.toDTO(product);
  }
}
