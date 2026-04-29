import { NextResponse } from 'next/server';

import {
  DomainException,
  DuplicateSkuException,
  InsufficientStockException,
  ProductNotFoundException,
} from '@/domain/exceptions/DomainException';

/**
 * Helpers for building consistent JSON API responses.
 * Decides HTTP status codes based on application exceptions.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function handleError(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof ProductNotFoundException) {
    return errorResponse(err.code, err.message, 404);
  }
  if (err instanceof DuplicateSkuException) {
    return errorResponse(err.code, err.message, 409);
  }
  if (err instanceof InsufficientStockException) {
    return errorResponse(err.code, err.message, 422);
  }
  if (err instanceof DomainException) {
    return errorResponse(err.code, err.message, 400);
  }
  if (err instanceof Error) {
    return errorResponse('INTERNAL_ERROR', err.message, 500);
  }
  return errorResponse('UNKNOWN_ERROR', 'An unexpected error occurred', 500);
}
