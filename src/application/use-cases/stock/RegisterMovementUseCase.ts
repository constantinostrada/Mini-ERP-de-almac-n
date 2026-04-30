import { StockMovement, type MovementType } from '@/domain/entities/StockMovement';
import {
  InsufficientStockException,
  ProductNotFoundException,
} from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';

import type {
  PublicMovementType,
  PublicStockMovementDTO,
  RegisterMovementDTO,
} from '../../dtos/StockMovementDTO';
import type { IIdGenerator } from '../../ports/IIdGenerator';
import type { IMutex } from '../../ports/IMutex';

const PUBLIC_TO_DOMAIN: Record<PublicMovementType, MovementType> = {
  INGRESO: 'INBOUND',
  EGRESO: 'OUTBOUND',
};

const DOMAIN_TO_PUBLIC: Partial<Record<MovementType, PublicMovementType>> = {
  INBOUND: 'INGRESO',
  OUTBOUND: 'EGRESO',
};

/**
 * Use Case — RegisterMovementUseCase
 *
 * Registers an INGRESO (inbound) or EGRESO (outbound) movement and updates
 * the product's stock atomically. EGRESO that would leave stock negative
 * is rejected with InsufficientStockException (mapped to HTTP 422).
 *
 * Concurrency: read-modify-write of a product's stock is serialized per
 * product via IMutex, so two simultaneous EGRESO calls cannot race past
 * the availability check.
 */
export class RegisterMovementUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly mutex: IMutex,
  ) {}

  async execute(dto: RegisterMovementDTO): Promise<PublicStockMovementDTO> {
    if (!dto.productId || dto.productId.trim().length === 0) {
      throw new Error('product_id is required');
    }
    if (dto.type !== 'INGRESO' && dto.type !== 'EGRESO') {
      throw new Error(`Invalid movement type: "${String(dto.type)}". Expected INGRESO or EGRESO.`);
    }
    if (!Number.isInteger(dto.quantity) || dto.quantity <= 0) {
      throw new Error('quantity must be an integer greater than zero');
    }

    const productId = ProductId.create(dto.productId);
    const quantity = Quantity.create(dto.quantity);
    const domainType = PUBLIC_TO_DOMAIN[dto.type];

    return this.mutex.runExclusive(productId.value, async () => {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new ProductNotFoundException(dto.productId);
      }

      if (domainType === 'INBOUND') {
        product.receiveStock(quantity);
      } else {
        if (!product.stockQuantity.isGreaterThanOrEqualTo(quantity)) {
          throw new InsufficientStockException(
            product.name,
            quantity.value,
            product.stockQuantity.value,
          );
        }
        product.dispatchStock(quantity);
      }

      const movement = StockMovement.create({
        id: this.idGenerator.generate(),
        productId,
        type: domainType,
        quantity,
        reason: dto.reason,
        occurredAt: new Date(),
      });

      await this.productRepository.update(product);
      await this.stockMovementRepository.save(movement);

      return {
        id: movement.id,
        product_id: productId.value,
        type: dto.type,
        quantity: quantity.value,
        reason: movement.reason,
        created_at: movement.occurredAt.toISOString(),
      };
    });
  }

  static toPublicDTO(movement: StockMovement): PublicStockMovementDTO | null {
    const publicType = DOMAIN_TO_PUBLIC[movement.type];
    if (!publicType) return null;
    return {
      id: movement.id,
      product_id: movement.productId.value,
      type: publicType,
      quantity: movement.quantity.value,
      reason: movement.reason,
      created_at: movement.occurredAt.toISOString(),
    };
  }
}
