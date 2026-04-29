import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { ProductId } from '@/domain/value-objects/ProductId';

import type { GetMovementsByProductDTO, StockMovementDTO } from '../../dtos/StockMovementDTO';
import { StockMovementMapper } from '../../mappers/StockMovementMapper';

/**
 * Use Case — GetStockMovementsUseCase
 *
 * Retrieves the audit trail of stock movements for a given product.
 */
export class GetStockMovementsUseCase {
  constructor(private readonly stockMovementRepository: IStockMovementRepository) {}

  async execute(dto: GetMovementsByProductDTO): Promise<StockMovementDTO[]> {
    const productId = ProductId.create(dto.productId);
    const movements = await this.stockMovementRepository.findByProductId(productId);
    return StockMovementMapper.toDTOList(movements);
  }
}
