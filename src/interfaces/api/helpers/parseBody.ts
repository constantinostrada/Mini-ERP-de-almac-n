import type { NextRequest } from 'next/server';

/**
 * Safely parses the JSON body of a Next.js request.
 * Returns null on parse failure rather than throwing.
 */
export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    const body = (await req.json()) as T;
    return body;
  } catch {
    return null;
  }
}
