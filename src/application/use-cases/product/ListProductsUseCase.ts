import type { IProductRepository } from '@/domain/repositories/IProductRepository';

import type {
  ListProductsQueryDTO,
  PaginatedProductsDTO,
} from '../../dtos/ProductDTO';
import { ProductMapper } from '../../mappers/ProductMapper';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Use Case — ListProductsUseCase
 *
 * Returns a paginated slice of the product catalog along with pagination
 * metadata. `page` is 1-based; `pageSize` is clamped to [1, 100].
 */
export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(query: ListProductsQueryDTO = {}): Promise<PaginatedProductsDTO> {
    const pageSize = clamp(
      Number.isFinite(query.pageSize) ? Math.trunc(query.pageSize as number) : DEFAULT_PAGE_SIZE,
      1,
      MAX_PAGE_SIZE,
    );
    const requestedPage = Number.isFinite(query.page)
      ? Math.trunc(query.page as number)
      : DEFAULT_PAGE;
    const page = requestedPage < 1 ? 1 : requestedPage;

    const products = await this.productRepository.findAll();
    const total = products.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = products.slice(start, end);

    return {
      items: ProductMapper.toDTOList(slice),
      pagination: { page, pageSize, total, totalPages },
    };
  }
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
