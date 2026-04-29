import { Money } from '../value-objects/Money';

describe('Money value object', () => {
  it('creates money from decimal', () => {
    const m = Money.fromDecimal(19.99, 'EUR');
    expect(m.amountCents).toBe(1999);
    expect(m.currency).toBe('EUR');
    expect(m.amount).toBeCloseTo(19.99);
  });

  it('creates money from cents', () => {
    const m = Money.fromCents(500, 'USD');
    expect(m.amount).toBe(5);
  });

  it('adds two money instances of same currency', () => {
    const a = Money.fromDecimal(10, 'EUR');
    const b = Money.fromDecimal(5.5, 'EUR');
    expect(a.add(b).amount).toBeCloseTo(15.5);
  });

  it('throws when adding different currencies', () => {
    const a = Money.fromDecimal(10, 'EUR');
    const b = Money.fromDecimal(10, 'USD');
    expect(() => a.add(b)).toThrow(/different currencies/);
  });

  it('multiplies correctly', () => {
    const m = Money.fromDecimal(9.99, 'EUR');
    expect(m.multiply(3).amount).toBeCloseTo(29.97);
  });

  it('throws on negative amount', () => {
    expect(() => Money.fromCents(-1, 'EUR')).toThrow(/negative/);
  });

  it('throws on invalid currency code', () => {
    expect(() => Money.fromDecimal(10, 'EU')).toThrow(/ISO code/);
  });
});
