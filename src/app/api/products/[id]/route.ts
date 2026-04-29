import type { NextRequest } from 'next/server';

import type { UpdateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

interface RouteContext {
  params: { id: string };
}

/**
 * Route handler — /api/products/[id]
 *
 * GET    → get product by ID
 * PUT    → update product
 * DELETE → delete product
 */

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const product = await container.getProductById.execute({ id: params.id });
    return successResponse(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const body = await parseBody<Omit<UpdateProductDTO, 'id'>>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    const updated = await container.updateProduct.execute({ ...body, id: params.id });
    return successResponse(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    await container.deleteProduct.execute({ id: params.id });
    return successResponse({ message: 'Product deleted successfully' });
  } catch (err) {
    return handleError(err);
  }
}
