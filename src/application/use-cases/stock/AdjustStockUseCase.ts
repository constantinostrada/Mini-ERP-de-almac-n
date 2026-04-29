import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { StockMovement } from '@/domain/entities/StockMovement';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';

import type { AdjustStockDTO } from '../../dtos/ProductDTO';
import type { StockMovementDTO } from '../../dtos/StockMovementDTO';
import { StockMovementMapper } from '../../mappers/StockMovementMapper';
import type { IIdGenerator } from '../../ports/IIdGenerator';

/**
 * Use Case — AdjustStockUseCase
 *
 * Records an inbound delivery, outbound dispatch, or manual adjustment.
 * Updates the product's stock level and persists an audit movement record.
 */
export class AdjustStockUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: AdjustStockDTO): Promise<StockMovementDTO> {
    const productId = ProductId.create(dto.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.productId);
    }

    const quantity = Quantity.create(dto.quantity);
    const unitCost = Money.fromDecimal(dto.unitCostAmount, dto.unitCostCurrency);

    // Delegate stock mutation to the entity (domain rules enforced there)
    switch (dto.type) {
      case 'INBOUND':
        product.receiveStock(quantity);
        break;
      case 'OUTBOUND':
        product.dispatchStock(quantity);
        break;
      case 'ADJUSTMENT':
        // For adjustments we set a new absolute quantity — handled by re-creating state
        // This simplified implementation treats adjustment as inbound/outbound delta
        if (dto.quantity >= 0) {
          product.receiveStock(quantity);
        } else {
          product.dispatchStock(Quantity.create(Math.abs(dto.quantity)));
        }
        break;
    }

    const movement = StockMovement.create({
      id: this.idGenerator.generate(),
      productId,
      type: dto.type,
      quantity,
      unitCost,
      reason: dto.reason,
      reference: dto.reference,
      occurredAt: new Date(),
    });

    // Persist both the updated product and the new movement record
    await this.productRepository.update(product);
    await this.stockMovementRepository.save(movement);

    return StockMovementMapper.toDTO(movement);
  }
}
