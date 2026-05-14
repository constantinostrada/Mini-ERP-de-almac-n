export interface BranchOption {
  readonly code: string;
  readonly name: string;
}

export interface ExpenseCategoryOption {
  readonly code: string;
  readonly name: string;
}

export const BRANCHES: ReadonlyArray<BranchOption> = [
  { code: 'CENTRO', name: 'Sucursal Centro' },
  { code: 'NORTE', name: 'Sucursal Norte' },
  { code: 'SUR', name: 'Sucursal Sur' },
] as const;

export const EXPENSE_CATEGORIES: ReadonlyArray<ExpenseCategoryOption> = [
  { code: 'ALQUILER', name: 'Alquiler' },
  { code: 'SERVICIOS', name: 'Servicios' },
  { code: 'SUELDOS', name: 'Sueldos' },
  { code: 'COMPRA', name: 'Compra' },
  { code: 'OTROS', name: 'Otros' },
] as const;

export type BranchCode = (typeof BRANCHES)[number]['code'];
export type ExpenseCategoryCode = (typeof EXPENSE_CATEGORIES)[number]['code'];
