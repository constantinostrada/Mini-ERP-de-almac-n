import { Product } from '@/domain/entities/Product';
import { DuplicateSkuException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';
import { SKU } from '@/domain/value-objects/SKU';

import type { CreateProductDTO, ProductDTO } from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';
import type { IIdGenerator } from '../../ports/IIdGenerator';

/**
 * Use Case — CreateProductUseCase
 *
 * Registers a new product in the warehouse catalog.
 * Enforces SKU uniqueness before persisting.
 */
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: CreateProductDTO): Promise<ProductDTO> {
    const sku = SKU.create(dto.sku);

    const skuExists = await this.productRepository.existsBySku(sku);
    if (skuExists) {
      throw new DuplicateSkuException(dto.sku);
    }

    const id = ProductId.create(this.idGenerator.generate());

    const product = Product.create({
      id,
      sku,
      name: dto.name,
      description: dto.description ?? '',
      notes: dto.notes,
      unitPrice: Money.fromDecimal(dto.unitPriceAmount, dto.unitPriceCurrency),
      stockQuantity: Quantity.create(dto.initialStockQuantity),
      reorderThreshold: Quantity.create(dto.reorderThreshold),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.productRepository.save(product);

    return ProductMapper.toDTO(product);
  }
}
