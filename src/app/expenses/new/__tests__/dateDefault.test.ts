import { todayISODate } from '../dateDefault';

describe('todayISODate — AC 75a45f9b65ac (campo fecha con valor por defecto = hoy)', () => {
  it('returns the ISO date (YYYY-MM-DD) for the given Date', () => {
    const fixed = new Date(2026, 4, 14, 10, 0, 0); // local-time May 14 2026
    expect(todayISODate(fixed)).toBe('2026-05-14');
  });

  it('zero-pads single-digit months and days', () => {
    const fixed = new Date(2026, 0, 3, 0, 0, 0); // Jan 3 2026 local
    expect(todayISODate(fixed)).toBe('2026-01-03');
  });

  it('uses the current date when no argument is given', () => {
    const now = new Date();
    const expected = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    expect(todayISODate()).toBe(expected);
  });
});
