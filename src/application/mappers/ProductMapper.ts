import type { Product } from '@/domain/entities/Product';

import type { ProductDTO } from '../dtos/ProductDTO';

/**
 * Mapper — ProductMapper
 *
 * Converts between domain entities and application DTOs.
 * Domain entities never leak into the interfaces or infrastructure layers directly.
 */
export class ProductMapper {
  static toDTO(product: Product): ProductDTO {
    return {
      id: product.id.value,
      sku: product.sku.value,
      name: product.name,
      description: product.description,
      unitPriceAmount: product.unitPrice.amount,
      unitPriceCurrency: product.unitPrice.currency,
      stockQuantity: product.stockQuantity.value,
      reorderThreshold: product.reorderThreshold.value,
      needsReorder: product.needsReorder(),
      supplierId: product.supplierId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static toDTOList(products: Product[]): ProductDTO[] {
    return products.map(ProductMapper.toDTO);
  }
}
