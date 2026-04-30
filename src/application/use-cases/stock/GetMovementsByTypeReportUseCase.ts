import type { MovementType } from '@/domain/entities/StockMovement';
import type { IProductRepository } from '@/domain/repositories/IProductRepository';
import type { IStockMovementRepository } from '@/domain/repositories/IStockMovementRepository';

import type {
  MovementsByTypeReportItemDTO,
  PublicMovementType,
} from '../../dtos/StockMovementDTO';

const PUBLIC_TO_DOMAIN: Record<PublicMovementType, MovementType> = {
  INGRESO: 'INBOUND',
  EGRESO: 'OUTBOUND',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface GetMovementsByTypeReportDTO {
  type: PublicMovementType;
  days: number;
}

/**
 * Use Case — GetMovementsByTypeReportUseCase
 *
 * Returns the audit trail of INGRESO or EGRESO movements that occurred in
 * the last `days` days, joined with their product so each row carries
 * sku and product_name. Sorted by occurred_at descending.
 */
export class GetMovementsByTypeReportUseCase {
  constructor(
    private readonly stockMovementRepository: IStockMovementRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: GetMovementsByTypeReportDTO): Promise<MovementsByTypeReportItemDTO[]> {
    if (dto.type !== 'INGRESO' && dto.type !== 'EGRESO') {
      throw new Error(
        `Invalid type: "${String(dto.type)}". Expected INGRESO or EGRESO.`,
      );
    }
    if (!Number.isInteger(dto.days) || dto.days <= 0) {
      throw new Error('days must be a positive integer');
    }

    const domainType = PUBLIC_TO_DOMAIN[dto.type];
    const to = new Date();
    const from = new Date(to.getTime() - dto.days * MS_PER_DAY);

    const movements = await this.stockMovementRepository.findByDateRange(from, to);
    const products = await this.productRepository.findAll();
    const productById = new Map(products.map((p) => [p.id.value, p]));

    return movements
      .filter((m) => m.type === domainType)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .map((m) => {
        const product = productById.get(m.productId.value);
        if (!product) return null;
        const item: MovementsByTypeReportItemDTO = {
          sku: product.sku.value,
          product_name: product.name,
          type: dto.type,
          quantity: m.quantity.value,
          occurred_at: m.occurredAt.toISOString(),
        };
        return item;
      })
      .filter((item): item is MovementsByTypeReportItemDTO => item !== null);
  }
}
