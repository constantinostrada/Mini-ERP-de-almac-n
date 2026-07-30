import type { NextRequest } from 'next/server';

import type { UpdateSupplierDTO } from '@/application/dtos/SupplierDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

interface RouteContext {
  params: { id: string };
}

/**
 * Route handler — /api/suppliers/[id]
 *
 * GET    → get supplier by ID
 * PUT    → update supplier
 * DELETE → delete supplier
 */

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const supplier = await container.getSupplierById.execute({ id: params.id });
    return successResponse(supplier);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    const body = await parseBody<Omit<UpdateSupplierDTO, 'id'>>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    if (!body.name || !body.contactEmail) {
      return handleError(new Error('Missing required fields: name, contactEmail'));
    }

    const updated = await container.updateSupplier.execute({ ...body, id: params.id });
    return successResponse(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<Response> {
  try {
    await container.deleteSupplier.execute({ id: params.id });
    return successResponse({ message: 'Supplier deleted successfully' });
  } catch (err) {
    return handleError(err);
  }
}
