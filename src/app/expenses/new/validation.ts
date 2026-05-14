import { BRANCHES, EXPENSE_CATEGORIES } from './catalogs';

export interface ExpenseFormInput {
  branchCode: string;
  categoryCode: string;
  amount: string;
  description: string;
  date: string;
}

export type ExpenseFieldError =
  | 'branch_required'
  | 'branch_invalid'
  | 'category_required'
  | 'category_invalid'
  | 'amount_required'
  | 'amount_not_a_number'
  | 'amount_not_positive'
  | 'description_required'
  | 'description_too_long'
  | 'date_required'
  | 'date_invalid';

export interface ExpenseFormErrors {
  branchCode?: ExpenseFieldError;
  categoryCode?: ExpenseFieldError;
  amount?: ExpenseFieldError;
  description?: ExpenseFieldError;
  date?: ExpenseFieldError;
}

export interface ValidExpensePayload {
  branchCode: string;
  categoryCode: string;
  amount: number;
  description: string;
  date: string;
}

export type ValidationResult =
  | { ok: true; payload: ValidExpensePayload }
  | { ok: false; errors: ExpenseFormErrors };

const DESCRIPTION_MAX = 200;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateExpenseForm(input: ExpenseFormInput): ValidationResult {
  const errors: ExpenseFormErrors = {};

  const branch = input.branchCode.trim();
  if (branch.length === 0) {
    errors.branchCode = 'branch_required';
  } else if (!BRANCHES.some((b) => b.code === branch)) {
    errors.branchCode = 'branch_invalid';
  }

  const category = input.categoryCode.trim();
  if (category.length === 0) {
    errors.categoryCode = 'category_required';
  } else if (!EXPENSE_CATEGORIES.some((c) => c.code === category)) {
    errors.categoryCode = 'category_invalid';
  }

  const amountRaw = input.amount.trim();
  let amountNum = NaN;
  if (amountRaw.length === 0) {
    errors.amount = 'amount_required';
  } else {
    amountNum = Number(amountRaw);
    if (!Number.isFinite(amountNum)) {
      errors.amount = 'amount_not_a_number';
    } else if (amountNum <= 0) {
      errors.amount = 'amount_not_positive';
    }
  }

  const description = input.description.trim();
  if (description.length === 0) {
    errors.description = 'description_required';
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = 'description_too_long';
  }

  const date = input.date.trim();
  if (date.length === 0) {
    errors.date = 'date_required';
  } else if (!ISO_DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    errors.date = 'date_invalid';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: {
      branchCode: branch,
      categoryCode: category,
      amount: amountNum,
      description,
      date,
    },
  };
}

export const ERROR_MESSAGES: Record<ExpenseFieldError, string> = {
  branch_required: 'Seleccioná una sucursal',
  branch_invalid: 'Sucursal inválida',
  category_required: 'Seleccioná una categoría',
  category_invalid: 'Categoría inválida',
  amount_required: 'Ingresá un monto',
  amount_not_a_number: 'El monto debe ser un número',
  amount_not_positive: 'El monto debe ser mayor a 0',
  description_required: 'Ingresá una descripción',
  description_too_long: `La descripción no puede superar ${DESCRIPTION_MAX} caracteres`,
  date_required: 'Seleccioná una fecha',
  date_invalid: 'Fecha inválida',
};
