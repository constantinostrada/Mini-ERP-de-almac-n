import { container } from '@/infrastructure/container/Container';
import { handleError } from '@/interfaces/api/helpers/apiResponse';
import { toCsv } from '@/interfaces/api/helpers/csv';

/**
 * Route handler — /api/movements/export
 *
 * GET → downloads every stock movement in the warehouse as a CSV file.
 */

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const rows = await container.getStockMovementsExport.execute();
    const csv = toCsv(
      ['fecha', 'producto', 'sku', 'tipo', 'cantidad', 'stock_resultante'],
      rows.map((row) => [
        row.date,
        row.productName,
        row.sku,
        row.type,
        row.quantity,
        row.resultingStock,
      ]),
    );

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="stock-movements.csv"',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
