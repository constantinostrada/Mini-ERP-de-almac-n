import type { NextRequest } from 'next/server';

import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/valuation
 *
 * GET → returns total warehouse inventory valuation
 * Query params:
 *   currency (default: USD)
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency') ?? 'USD';

    const valuation = await container.getWarehouseValuation.execute({ currency });
    return successResponse(valuation);
  } catch (err) {
    return handleError(err);
  }
}
