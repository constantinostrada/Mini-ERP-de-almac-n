/**
 * Prisma seed — idempotent.
 *
 * Seeds the two fixed catalogs used across the ERP:
 *   • 3 sucursales (Branch)
 *   • 5 categorías de gasto (ExpenseCategory)
 *
 * Running this script multiple times does NOT create duplicates thanks to
 * `upsert` on the unique `code` field.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Fixed data ──────────────────────────────────────────────────────────────

const BRANCHES: ReadonlyArray<{ code: string; name: string; address: string }> = [
  { code: 'CENTRO', name: 'Sucursal Centro', address: 'Av. Principal 123' },
  { code: 'NORTE', name: 'Sucursal Norte', address: 'Av. del Norte 456' },
  { code: 'SUR', name: 'Sucursal Sur', address: 'Av. del Sur 789' },
] as const;

const EXPENSE_CATEGORIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'ALQUILER', name: 'Alquiler' },
  { code: 'SERVICIOS', name: 'Servicios' },
  { code: 'SUELDOS', name: 'Sueldos' },
  { code: 'COMPRA', name: 'Compra' },
  { code: 'OTROS', name: 'Otros' },
] as const;

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 Seeding database…');

  for (const branch of BRANCHES) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: { name: branch.name, address: branch.address },
      create: branch,
    });
  }
  console.log(`  ✓ ${BRANCHES.length} sucursales listas`);

  for (const category of EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { code: category.code },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`  ✓ ${EXPENSE_CATEGORIES.length} categorías de gasto listas`);

  console.log('✅ Seed completado.');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed falló:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
