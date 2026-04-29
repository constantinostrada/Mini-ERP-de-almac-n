import { Quantity } from '../value-objects/Quantity';

describe('Quantity value object', () => {
  it('creates a valid quantity', () => {
    expect(Quantity.create(5).value).toBe(5);
  });

  it('creates zero quantity', () => {
    expect(Quantity.zero().value).toBe(0);
  });

  it('adds quantities', () => {
    expect(Quantity.create(3).add(Quantity.create(7)).value).toBe(10);
  });

  it('subtracts quantities', () => {
    expect(Quantity.create(10).subtract(Quantity.create(4)).value).toBe(6);
  });

  it('throws when subtracting would yield negative', () => {
    expect(() => Quantity.create(2).subtract(Quantity.create(5))).toThrow(/negative/);
  });

  it('throws on fractional value', () => {
    expect(() => Quantity.create(1.5)).toThrow(/integer/);
  });

  it('throws on negative value', () => {
    expect(() => Quantity.create(-1)).toThrow(/negative/);
  });

  it('compares quantities correctly', () => {
    expect(Quantity.create(5).isGreaterThanOrEqualTo(Quantity.create(5))).toBe(true);
    expect(Quantity.create(6).isGreaterThanOrEqualTo(Quantity.create(5))).toBe(true);
    expect(Quantity.create(4).isGreaterThanOrEqualTo(Quantity.create(5))).toBe(false);
  });
});
