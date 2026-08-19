import type { NextRequest } from 'next/server';

import { container } from '@/infrastructure/container/Container';

import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

interface RouteContext {
  params: { id: string };
}

/**
 * Route handler — /api/products/[id]/movements
 *
 * GET → stock movement history of a product (newest first), each entry
 *       with date, type, quantity and resulting stock level.
 */

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const history = await container.getProductMovementHistory.execute({ productId: params.id });
    return successResponse(history);
  } catch (err) {
    return handleError(err);
  }
}
