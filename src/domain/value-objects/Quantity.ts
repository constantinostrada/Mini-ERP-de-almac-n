/**
 * Value Object — Quantity
 *
 * Represents a non-negative integer quantity of items in the warehouse.
 * Protects against negative or fractional stock values.
 */
export class Quantity {
  private readonly _value: number;

  private constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error(`Quantity must be an integer, received: ${value}`);
    }
    if (value < 0) {
      throw new Error(`Quantity cannot be negative, received: ${value}`);
    }
    this._value = value;
  }

  static create(value: number): Quantity {
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  get value(): number {
    return this._value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  subtract(other: Quantity): Quantity {
    const result = this._value - other._value;
    if (result < 0) {
      throw new Error(
        `Cannot subtract ${other._value} from ${this._value}: result would be negative`,
      );
    }
    return new Quantity(result);
  }

  isGreaterThanOrEqualTo(other: Quantity): boolean {
    return this._value >= other._value;
  }

  equals(other: Quantity): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }
}
