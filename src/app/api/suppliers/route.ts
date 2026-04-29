import type { NextRequest } from 'next/server';

import type { CreateSupplierDTO } from '@/application/dtos/SupplierDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

/**
 * Route handler — /api/suppliers
 *
 * GET  → list all suppliers
 * POST → register a new supplier
 */

export async function GET(): Promise<Response> {
  try {
    const suppliers = await container.listSuppliers.execute();
    return successResponse(suppliers);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await parseBody<CreateSupplierDTO>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    if (!body.name || !body.contactEmail) {
      return handleError(new Error('Missing required fields: name, contactEmail'));
    }

    const supplier = await container.createSupplier.execute(body);
    return successResponse(supplier, 201);
  } catch (err) {
    return handleError(err);
  }
}
