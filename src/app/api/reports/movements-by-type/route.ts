import type { NextRequest } from 'next/server';

import type { PublicMovementType } from '@/application/dtos/StockMovementDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/reports/movements-by-type
 *
 * GET → returns movements of the given type (INGRESO|EGRESO) registered in
 * the last `days` days. Each row carries sku, product_name, type, quantity
 * and occurred_at, sorted by occurred_at descending.
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const daysParam = searchParams.get('days');

    if (!typeParam) {
      return handleError(new Error('type query param is required (INGRESO|EGRESO)'));
    }
    if (!daysParam) {
      return handleError(new Error('days query param is required'));
    }

    const days = Number(daysParam);
    if (!Number.isFinite(days)) {
      return handleError(new Error('days must be a number'));
    }

    const items = await container.getMovementsByTypeReport.execute({
      type: typeParam as PublicMovementType,
      days,
    });
    return successResponse(items);
  } catch (err) {
    return handleError(err);
  }
}
