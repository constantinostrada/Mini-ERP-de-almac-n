import { INITIAL_STATE, reduceFormState } from '../formState';

describe('reduceFormState — AC 3185596a3721 (confirmación visual post-creación)', () => {
  it('starts in idle', () => {
    expect(INITIAL_STATE.kind).toBe('idle');
  });

  it('transitions idle → submitting on submit_start', () => {
    const next = reduceFormState(INITIAL_STATE, { type: 'submit_start' });
    expect(next.kind).toBe('submitting');
  });

  it('transitions submitting → success and keeps the created expense for the confirmation view', () => {
    const submitting = reduceFormState(INITIAL_STATE, { type: 'submit_start' });
    const created = {
      branchCode: 'CENTRO',
      categoryCode: 'SERVICIOS',
      amount: 100,
      description: 'Test',
      date: '2026-05-14',
    };
    const next = reduceFormState(submitting, { type: 'submit_success', created });
    expect(next.kind).toBe('success');
    if (next.kind === 'success') {
      expect(next.created).toEqual(created);
    }
  });

  it('transitions submitting → error with a message', () => {
    const submitting = reduceFormState(INITIAL_STATE, { type: 'submit_start' });
    const next = reduceFormState(submitting, {
      type: 'submit_error',
      message: 'boom',
    });
    expect(next.kind).toBe('error');
    if (next.kind === 'error') expect(next.message).toBe('boom');
  });

  it('reset returns to idle from any state (used by "Crear otro gasto")', () => {
    const created = {
      branchCode: 'NORTE',
      categoryCode: 'COMPRA',
      amount: 10,
      description: 'x',
      date: '2026-05-14',
    };
    const success = reduceFormState(INITIAL_STATE, { type: 'submit_success', created });
    expect(reduceFormState(success, { type: 'reset' })).toEqual(INITIAL_STATE);
  });
});
