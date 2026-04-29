import type { NextRequest } from 'next/server';

import type { CreateProductDTO } from '@/application/dtos/ProductDTO';
import { container } from '@/infrastructure/container/Container';
import { handleError, successResponse } from '@/interfaces/api/helpers/apiResponse';
import { parseBody } from '@/interfaces/api/helpers/parseBody';

/**
 * Route handler — /api/products
 *
 * GET  → list all products
 * POST → create a new product
 */

export async function GET(): Promise<Response> {
  try {
    const products = await container.listProducts.execute();
    return successResponse(products);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await parseBody<CreateProductDTO>(req);

    if (!body) {
      return handleError(new Error('Invalid or missing JSON body'));
    }

    // Thin input validation — business rules live in domain
    if (!body.sku || !body.name || !body.unitPriceCurrency) {
      return handleError(new Error('Missing required fields: sku, name, unitPriceCurrency'));
    }

    const product = await container.createProduct.execute(body);
    return successResponse(product, 201);
  } catch (err) {
    return handleError(err);
  }
}
