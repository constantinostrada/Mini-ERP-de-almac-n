import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton.
 *
 * In development Next.js hot-reloads modules, which would otherwise create a
 * new client (and a new pool) on every change, exhausting DB connections.
 * We cache the instance on `globalThis` to keep exactly one client per process.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Re-export generated types so callers in infrastructure/* can consume them
// without reaching into node_modules directly.
export type {
  Branch,
  Product,
  StockMovement,
  Expense,
  ExpenseCategory,
  MovementType,
  Prisma,
} from '@prisma/client';
