import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';

import type { ProductDTO, UpdateProductDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

/**
 * Use Case — UpdateProductUseCase
 *
 * Updates a product's details (name, description, price, reorder threshold).
 */
export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: UpdateProductDTO): Promise<ProductDTO> {
    const productId = ProductId.create(dto.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.id);
    }

    product.updateDetails(dto.name, dto.description ?? '', dto.notes);
    product.updatePrice(Money.fromDecimal(dto.unitPriceAmount, dto.unitPriceCurrency));
    product.updateReorderThreshold(Quantity.create(dto.reorderThreshold));

    await this.productRepository.update(product);

    return ProductMapper.toDTO(product);
  }
}
