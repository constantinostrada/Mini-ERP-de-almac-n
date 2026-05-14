import { validateExpenseForm, type ExpenseFormInput } from '../validation';

function validInput(over: Partial<ExpenseFormInput> = {}): ExpenseFormInput {
  return {
    branchCode: 'CENTRO',
    categoryCode: 'SERVICIOS',
    amount: '150.50',
    description: 'Factura de luz',
    date: '2026-05-14',
    ...over,
  };
}

describe('validateExpenseForm — AC b12451cfa17f (todos los campos validados antes de enviar)', () => {
  it('accepts a fully valid input and exposes the parsed payload', () => {
    const result = validateExpenseForm(validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({
        branchCode: 'CENTRO',
        categoryCode: 'SERVICIOS',
        amount: 150.5,
        description: 'Factura de luz',
        date: '2026-05-14',
      });
    }
  });

  it('rejects empty branch', () => {
    const result = validateExpenseForm(validInput({ branchCode: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.branchCode).toBe('branch_required');
  });

  it('rejects unknown branch code', () => {
    const result = validateExpenseForm(validInput({ branchCode: 'NO_EXISTE' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.branchCode).toBe('branch_invalid');
  });

  it('rejects empty category', () => {
    const result = validateExpenseForm(validInput({ categoryCode: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.categoryCode).toBe('category_required');
  });

  it('rejects unknown category code', () => {
    const result = validateExpenseForm(validInput({ categoryCode: 'INVENTADA' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.categoryCode).toBe('category_invalid');
  });

  it('rejects empty amount', () => {
    const result = validateExpenseForm(validInput({ amount: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.amount).toBe('amount_required');
  });

  it('rejects non-numeric amount', () => {
    const result = validateExpenseForm(validInput({ amount: 'abc' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.amount).toBe('amount_not_a_number');
  });

  it('rejects zero amount', () => {
    const result = validateExpenseForm(validInput({ amount: '0' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.amount).toBe('amount_not_positive');
  });

  it('rejects negative amount', () => {
    const result = validateExpenseForm(validInput({ amount: '-5' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.amount).toBe('amount_not_positive');
  });

  it('rejects empty description', () => {
    const result = validateExpenseForm(validInput({ description: '   ' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.description).toBe('description_required');
  });

  it('rejects description over 200 characters', () => {
    const result = validateExpenseForm(validInput({ description: 'x'.repeat(201) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.description).toBe('description_too_long');
  });

  it('rejects empty date', () => {
    const result = validateExpenseForm(validInput({ date: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.date).toBe('date_required');
  });

  it('rejects malformed date', () => {
    const result = validateExpenseForm(validInput({ date: '14/05/2026' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.date).toBe('date_invalid');
  });

  it('aggregates multiple errors at once (does not short-circuit)', () => {
    const result = validateExpenseForm({
      branchCode: '',
      categoryCode: '',
      amount: '',
      description: '',
      date: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.branchCode).toBeDefined();
      expect(result.errors.categoryCode).toBeDefined();
      expect(result.errors.amount).toBeDefined();
      expect(result.errors.description).toBeDefined();
      expect(result.errors.date).toBeDefined();
    }
  });
});
