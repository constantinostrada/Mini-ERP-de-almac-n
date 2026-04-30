import type { NextRequest } from 'next/server';

import type { MoneyDTO, RegisterMovementDTO } from '@/application/dtos/StockMovementDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

interface RegisterMovementBody {
  product_id?: string;
  productId?: string;
  type?: string;
  quantity?: number;
  reason?: string;
  unit_cost?: MoneyDTO;
  unitCost?: MoneyDTO;
}

/**
 * Route handler — /api/movements
 *
 * POST → registers an INGRESO / EGRESO movement and updates product stock
 * GET  → lists movements for a product (?product_id=...)
 */

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await parseBody<RegisterMovementBody>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    const productId = body.product_id ?? body.productId;
    if (!productId || !body.type || body.quantity === undefined) {
      return handleError(new Error('Missing required fields: product_id, type, quantity'));
    }

    const dto: RegisterMovementDTO = {
      productId,
      type: body.type as RegisterMovementDTO['type'],
      quantity: body.quantity,
      reason: body.reason,
      unitCost: body.unit_cost ?? body.unitCost,
    };

    const movement = await container.registerMovement.execute(dto);
    return successResponse(movement, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const productId = req.nextUrl.searchParams.get('product_id') ?? undefined;
    const movements = await container.listPublicMovements.execute({ productId });
    return successResponse(movements);
  } catch (err) {
    return handleError(err);
  }
}
