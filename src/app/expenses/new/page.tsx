'use client';

import { useMemo, useReducer, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';

import { BRANCHES, EXPENSE_CATEGORIES } from './catalogs';
import { todayISODate } from './dateDefault';
import {
  INITIAL_STATE,
  reduceFormState,
  type CreatedExpense,
} from './formState';
import {
  ERROR_MESSAGES,
  validateExpenseForm,
  type ExpenseFormErrors,
  type ExpenseFormInput,
} from './validation';

const EMPTY_ERRORS: ExpenseFormErrors = {};

function emptyForm(today: string): ExpenseFormInput {
  return {
    branchCode: '',
    categoryCode: '',
    amount: '',
    description: '',
    date: today,
  };
}

export default function NewExpensePage(): ReactNode {
  const today = useMemo(() => todayISODate(), []);
  const [form, setForm] = useState<ExpenseFormInput>(() => emptyForm(today));
  const [errors, setErrors] = useState<ExpenseFormErrors>(EMPTY_ERRORS);
  const [state, dispatch] = useReducer(reduceFormState, INITIAL_STATE);

  const update =
    (field: keyof ExpenseFormInput) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const result = validateExpenseForm(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors(EMPTY_ERRORS);
    dispatch({ type: 'submit_start' });

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        const message = body?.error?.message ?? `Error ${res.status}`;
        dispatch({ type: 'submit_error', message });
        return;
      }
      const body = (await res.json().catch(() => null)) as
        | { data?: CreatedExpense }
        | null;
      const created: CreatedExpense = body?.data ?? result.payload;
      dispatch({ type: 'submit_success', created });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de red';
      dispatch({ type: 'submit_error', message });
    }
  };

  const resetAll = (): void => {
    setForm(emptyForm(today));
    setErrors(EMPTY_ERRORS);
    dispatch({ type: 'reset' });
  };

  if (state.kind === 'success') {
    const { created } = state;
    const branchName =
      BRANCHES.find((b) => b.code === created.branchCode)?.name ?? created.branchCode;
    const categoryName =
      EXPENSE_CATEGORIES.find((c) => c.code === created.categoryCode)?.name ??
      created.categoryCode;
    return (
      <div>
        <h2 className="section-title">Gasto registrado</h2>
        <div className="card" role="status" aria-live="polite" data-testid="expense-success">
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>
            ✅ El gasto se registró correctamente.
          </p>
          <ul style={{ lineHeight: 1.8 }}>
            <li>
              <strong>Sucursal:</strong> {branchName}
            </li>
            <li>
              <strong>Categoría:</strong> {categoryName}
            </li>
            <li>
              <strong>Monto:</strong> {created.amount.toFixed(2)}
            </li>
            <li>
              <strong>Fecha:</strong> {created.date}
            </li>
            <li>
              <strong>Descripción:</strong> {created.description}
            </li>
          </ul>
          <button type="button" onClick={resetAll} style={{ marginTop: '1rem' }}>
            Crear otro gasto
          </button>
        </div>
      </div>
    );
  }

  const submitting = state.kind === 'submitting';

  return (
    <div>
      <h2 className="section-title">Registrar gasto</h2>
      <p className="section-subtitle">
        Cargá un gasto manual de una sucursal. La categoría &quot;Compra&quot; está disponible
        aunque normalmente se genera automáticamente.
      </p>

      <form className="card" onSubmit={onSubmit} noValidate aria-label="Registrar gasto">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label>
            <span style={{ display: 'block', fontWeight: 600 }}>Sucursal</span>
            <select
              name="branchCode"
              value={form.branchCode}
              onChange={update('branchCode')}
              aria-invalid={Boolean(errors.branchCode)}
              required
            >
              <option value="">Seleccionar…</option>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.branchCode ? (
              <small role="alert">{ERROR_MESSAGES[errors.branchCode]}</small>
            ) : null}
          </label>

          <label>
            <span style={{ display: 'block', fontWeight: 600 }}>Categoría</span>
            <select
              name="categoryCode"
              value={form.categoryCode}
              onChange={update('categoryCode')}
              aria-invalid={Boolean(errors.categoryCode)}
              required
            >
              <option value="">Seleccionar…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryCode ? (
              <small role="alert">{ERROR_MESSAGES[errors.categoryCode]}</small>
            ) : null}
          </label>

          <label>
            <span style={{ display: 'block', fontWeight: 600 }}>Monto</span>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={update('amount')}
              aria-invalid={Boolean(errors.amount)}
              required
            />
            {errors.amount ? (
              <small role="alert">{ERROR_MESSAGES[errors.amount]}</small>
            ) : null}
          </label>

          <label>
            <span style={{ display: 'block', fontWeight: 600 }}>Descripción</span>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={update('description')}
              aria-invalid={Boolean(errors.description)}
              required
            />
            {errors.description ? (
              <small role="alert">{ERROR_MESSAGES[errors.description]}</small>
            ) : null}
          </label>

          <label>
            <span style={{ display: 'block', fontWeight: 600 }}>Fecha</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={update('date')}
              aria-invalid={Boolean(errors.date)}
              required
            />
            {errors.date ? (
              <small role="alert">{ERROR_MESSAGES[errors.date]}</small>
            ) : null}
          </label>

          {state.kind === 'error' ? (
            <p role="alert" style={{ color: 'var(--color-danger, #c0392b)' }}>
              {state.message}
            </p>
          ) : null}

          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Registrar gasto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
