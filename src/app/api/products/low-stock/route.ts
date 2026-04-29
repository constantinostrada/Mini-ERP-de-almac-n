import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/products/low-stock
 *
 * GET → returns all products that need reordering
 */
export async function GET(): Promise<Response> {
  try {
    const products = await container.getLowStockProducts.execute();
    return successResponse(products);
  } catch (err) {
    return handleError(err);
  }
}
