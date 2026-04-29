import type { NextRequest } from 'next/server';

import type { AdjustStockDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

interface RouteContext {
  params: { id: string };
}

/**
 * Route handler — /api/products/[id]/stock
 *
 * GET  → list stock movements for product
 * POST → record an inbound / outbound / adjustment
 */

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const movements = await container.getStockMovements.execute({ productId: params.id });
    return successResponse(movements);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const body = await parseBody<Omit<AdjustStockDTO, 'productId'>>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    if (!body.type || body.quantity === undefined || !body.reason) {
      return handleError(new Error('Missing required fields: type, quantity, reason'));
    }

    const movement = await container.adjustStock.execute({ ...body, productId: params.id });
    return successResponse(movement, 201);
  } catch (err) {
    return handleError(err);
  }
}
