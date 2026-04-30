import { StockMovement, type MovementType } from '@/domain/entities/StockMovement';
import {
  InsufficientStockException,
  ProductNotFoundException,
} from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { Money } from '@/domain/value-objects/Money';
import { ProductId } from '@/domain/value-objects/ProductId';
import { Quantity } from '@/domain/value-objects/Quantity';

import type {
  MoneyDTO,
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
    const unitCost = parseUnitCost(dto.unitCost);

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
        unitCost,
        occurredAt: new Date(),
      });

      await this.productRepository.update(product);
      await this.stockMovementRepository.save(movement);

      return toPublicShape(movement, dto.type);
    });
  }

  static toPublicDTO(movement: StockMovement): PublicStockMovementDTO | null {
    const publicType = DOMAIN_TO_PUBLIC[movement.type];
    if (!publicType) return null;
    return toPublicShape(movement, publicType);
  }
}

function parseUnitCost(input: MoneyDTO | undefined): Money | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== 'object') {
    throw new Error('unit_cost must be an object with { amount, currency }');
  }
  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
    throw new Error('unit_cost.amount must be a finite number');
  }
  if (typeof input.currency !== 'string' || input.currency.trim().length === 0) {
    throw new Error('unit_cost.currency must be a non-empty string');
  }
  return Money.fromDecimal(input.amount, input.currency);
}

function toPublicShape(
  movement: StockMovement,
  publicType: PublicMovementType,
): PublicStockMovementDTO {
  const dto: PublicStockMovementDTO = {
    id: movement.id,
    product_id: movement.productId.value,
    type: publicType,
    quantity: movement.quantity.value,
    reason: movement.reason,
    created_at: movement.occurredAt.toISOString(),
  };
  if (movement.unitCost) {
    dto.unit_cost = {
      amount: movement.unitCost.amount,
      currency: movement.unitCost.currency,
    };
  }
  return dto;
}
