/**
 * Value Object — SKU (Stock Keeping Unit)
 *
 * An alphanumeric identifier used to track products in inventory.
 * Format: uppercase letters, digits, and hyphens only (e.g. "PROD-001", "WH-A-42").
 */
export class SKU {
  private static readonly VALID_PATTERN = /^[A-Z0-9][A-Z0-9\-]{1,29}$/;
  private readonly _value: string;

  private constructor(value: string) {
    const normalized = value.trim().toUpperCase();
    if (!SKU.VALID_PATTERN.test(normalized)) {
      throw new Error(
        `Invalid SKU format: "${value}". Must be 2-30 uppercase alphanumeric characters or hyphens.`,
      );
    }
    this._value = normalized;
  }

  static create(value: string): SKU {
    return new SKU(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: SKU): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
