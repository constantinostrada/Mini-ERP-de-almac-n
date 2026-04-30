import type { NextRequest } from 'next/server';

import { container } from '@/infrastructure/container/Container';

import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/reports/idle-products
 *
 * GET → reports products with no movements in the last `days` days.
 *   ?days=N (required, integer > 0)
 *   ?include_never_moved=true (optional; includes products that never moved)
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const daysParam = req.nextUrl.searchParams.get('days');
    if (daysParam === null) {
      return handleError(new Error('days query parameter is required'));
    }
    const days = Number(daysParam);
    if (!Number.isFinite(days) || !Number.isInteger(days) || days < 0) {
      return handleError(new Error('days must be a non-negative integer'));
    }

    const includeNeverMovedParam =
      req.nextUrl.searchParams.get('include_never_moved') ?? '';
    const includeNeverMoved = includeNeverMovedParam.toLowerCase() === 'true';

    const result = await container.getIdleProducts.execute({
      days,
      includeNeverMoved,
    });
    return successResponse(result);
  } catch (err) {
    return handleError(err);
  }
}
