import { SKU } from '../value-objects/SKU';

describe('SKU value object', () => {
  it('creates a valid SKU and normalises to uppercase', () => {
    const sku = SKU.create('prod-001');
    expect(sku.value).toBe('PROD-001');
  });

  it('throws on SKU that is too short', () => {
    expect(() => SKU.create('A')).toThrow(/Invalid SKU/);
  });

  it('throws on SKU with invalid characters', () => {
    expect(() => SKU.create('PROD 001')).toThrow(/Invalid SKU/);
  });

  it('compares two equal SKUs', () => {
    const a = SKU.create('WH-001');
    const b = SKU.create('wh-001');
    expect(a.equals(b)).toBe(true);
  });
});
