export interface CreatedExpense {
  id?: string;
  branchCode: string;
  categoryCode: string;
  amount: number;
  description: string;
  date: string;
}

export type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; created: CreatedExpense }
  | { kind: 'error'; message: string };

export type FormAction =
  | { type: 'submit_start' }
  | { type: 'submit_success'; created: CreatedExpense }
  | { type: 'submit_error'; message: string }
  | { type: 'reset' };

export const INITIAL_STATE: FormState = { kind: 'idle' };

export function reduceFormState(_state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'submit_start':
      return { kind: 'submitting' };
    case 'submit_success':
      return { kind: 'success', created: action.created };
    case 'submit_error':
      return { kind: 'error', message: action.message };
    case 'reset':
      return INITIAL_STATE;
  }
}
