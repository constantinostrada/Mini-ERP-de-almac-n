import { ProductNotFoundException } from '@/domain/exceptions/DomainException';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';
import { ProductId } from '@/domain/value-objects/ProductId';

import type {
  GetProductMovementHistoryDTO,
  ProductMovementHistoryItemDTO,
} from '../../dtos/ProductMovementHistoryDTO';
import { ProductMovementHistoryMapper } from '../../mappers/ProductMovementHistoryMapper';

/**
 * Use Case — GetProductMovementHistoryUseCase
 *
 * Returns a product's stock movement history (inbound, outbound and
 * adjustments) ordered newest-first, annotating each movement with the
 * stock level that resulted from it. The resulting stock is reconstructed
 * by walking back from the product's current stock, so it stays correct
 * even when the product was created with a non-zero initial stock.
 */
export class GetProductMovementHistoryUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(dto: GetProductMovementHistoryDTO): Promise<ProductMovementHistoryItemDTO[]> {
    const productId = ProductId.create(dto.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundException(dto.productId);
    }

    // Repository contract: movements come ordered by date descending
    const movements = await this.stockMovementRepository.findByProductId(productId);

    let stockAfter = product.stockQuantity.value;
    return movements.map((movement) => {
      const item = ProductMovementHistoryMapper.toDTO(movement, stockAfter);
      stockAfter -= movement.stockDelta;
      return item;
    });
  }
}
