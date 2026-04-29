/**
 * Value Object — ProductId
 *
 * Represents a unique, immutable identifier for a Product.
 * Equality is determined by value, not by reference.
 */
export class ProductId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ProductId cannot be empty');
    }
    this._value = value.trim();
  }

  static create(value: string): ProductId {
    return new ProductId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ProductId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
