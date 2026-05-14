import { BRANCHES, EXPENSE_CATEGORIES } from '../catalogs';

describe('expense form catalogs', () => {
  describe('EXPENSE_CATEGORIES — AC 0ad107b38991 (dropdown con las 5 opciones del seed)', () => {
    it('contains exactly 5 categories', () => {
      expect(EXPENSE_CATEGORIES).toHaveLength(5);
    });

    it('matches the 5 seed codes', () => {
      const codes = EXPENSE_CATEGORIES.map((c) => c.code).sort();
      expect(codes).toEqual(['ALQUILER', 'COMPRA', 'OTROS', 'SERVICIOS', 'SUELDOS']);
    });

    it('includes COMPRA (which is normally auto-generated)', () => {
      expect(EXPENSE_CATEGORIES.some((c) => c.code === 'COMPRA')).toBe(true);
    });

    it('every category has a human-readable name', () => {
      for (const c of EXPENSE_CATEGORIES) {
        expect(c.name.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('BRANCHES — AC a73d64571637 (selector de sucursal con las 3 sucursales)', () => {
    it('contains exactly 3 branches', () => {
      expect(BRANCHES).toHaveLength(3);
    });

    it('matches the 3 seed branch codes', () => {
      const codes = BRANCHES.map((b) => b.code).sort();
      expect(codes).toEqual(['CENTRO', 'NORTE', 'SUR']);
    });

    it('every branch has a human-readable name', () => {
      for (const b of BRANCHES) {
        expect(b.name.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
