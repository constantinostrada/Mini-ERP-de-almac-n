/**
 * Value Object — Money
 *
 * Represents a monetary amount with a currency code.
 * Stored as integer cents to avoid floating-point errors.
 */
export class Money {
  private readonly _amountCents: number;
  private readonly _currency: string;

  private constructor(amountCents: number, currency: string) {
    if (!Number.isInteger(amountCents)) {
      throw new Error(`Money amount must be an integer (cents), received: ${amountCents}`);
    }
    if (amountCents < 0) {
      throw new Error(`Money amount cannot be negative, received: ${amountCents}`);
    }
    if (!currency || currency.trim().length !== 3) {
      throw new Error(`Currency must be a 3-letter ISO code, received: "${currency}"`);
    }
    this._amountCents = amountCents;
    this._currency = currency.toUpperCase();
  }

  /** Create from cents (e.g., 1999 = $19.99) */
  static fromCents(amountCents: number, currency: string): Money {
    return new Money(amountCents, currency);
  }

  /** Create from a decimal amount (e.g., 19.99) — rounds to nearest cent */
  static fromDecimal(amount: number, currency: string): Money {
    return new Money(Math.round(amount * 100), currency);
  }

  get amountCents(): number {
    return this._amountCents;
  }

  get currency(): string {
    return this._currency;
  }

  /** Returns the decimal representation (e.g., 19.99) */
  get amount(): number {
    return this._amountCents / 100;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amountCents + other._amountCents, this._currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) throw new Error('Multiplication factor cannot be negative');
    return new Money(Math.round(this._amountCents * factor), this._currency);
  }

  equals(other: Money): boolean {
    return this._amountCents === other._amountCents && this._currency === other._currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this._currency} and ${other._currency}`,
      );
    }
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this._currency}`;
  }
}
