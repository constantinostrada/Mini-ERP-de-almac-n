import type { NextRequest } from 'next/server';

import { container } from '@/infrastructure/container/Container';
import { errorResponse, handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';

/**
 * Route handler — /api/reports/low-stock
 *
 * GET → low-stock report.
 * Query params:
 *   threshold_pct (optional, number ≥ 0)
 *     When present, products whose current stock is within
 *     (1 + threshold_pct/100) × min_stock are also included as an
 *     early-alert signal.
 *
 * Response items: { sku, name, current_stock, min_stock, deficit, last_movement_at }
 * sorted by deficit (min_stock - current_stock) descending.
 */
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('threshold_pct');

    let thresholdPct: number | undefined;
    if (raw !== null && raw !== '') {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        return errorResponse(
          'INVALID_QUERY_PARAM',
          'threshold_pct must be a non-negative number',
          400,
        );
      }
      thresholdPct = parsed;
    }

    const report = await container.getLowStockReport.execute({ thresholdPct });
    return successResponse(report);
  } catch (err) {
    return handleError(err);
  }
}
