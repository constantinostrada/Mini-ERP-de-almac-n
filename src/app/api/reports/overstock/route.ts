import type { NextRequest } from 'next/server';

import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/reports/overstock
 *
 * GET → returns products with excess stock (current_stock >= ratio × min_stock).
 * Query params:
 *   ratio (optional, default = 2; must be a finite number >= 1)
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const raw = req.nextUrl.searchParams.get('ratio');
    const ratio = raw === null ? undefined : Number(raw);

    const report = await container.getOverstockedProducts.execute({ ratio });
    return successResponse(report);
  } catch (err) {
    return handleError(err);
  }
}
