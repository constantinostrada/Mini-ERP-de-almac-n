import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { ProductId } from '@/domain/value-objects/ProductId';

import type { PublicStockMovementDTO } from '../../dtos/StockMovementDTO';
import { RegisterMovementUseCase } from './RegisterMovementUseCase';

export interface ListPublicMovementsDTO {
  productId?: string;
}

/**
 * Use Case — ListPublicMovementsUseCase
 *
 * Returns the audit trail for the /movements endpoint in its public
 * (INGRESO / EGRESO) shape. Filters by product when productId is given;
 * otherwise returns nothing — listing every movement across the warehouse
 * is intentionally not exposed by this use case.
 */
export class ListPublicMovementsUseCase {
  constructor(private readonly stockMovementRepository: IStockMovementRepository) {}

  async execute(dto: ListPublicMovementsDTO): Promise<PublicStockMovementDTO[]> {
    if (!dto.productId || dto.productId.trim().length === 0) {
      return [];
    }
    const productId = ProductId.create(dto.productId);
    const movements = await this.stockMovementRepository.findByProductId(productId);
    return movements
      .map((m) => RegisterMovementUseCase.toPublicDTO(m))
      .filter((d): d is PublicStockMovementDTO => d !== null);
  }
}
