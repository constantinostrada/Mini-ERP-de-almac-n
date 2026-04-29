import type { Money } from '../value-objects/Money';
import type { ProductId } from '../value-objects/ProductId';
import type { Quantity } from '../value-objects/Quantity';
import type { SKU } from '../value-objects/SKU';

export interface ProductProps {
  id: ProductId;
  sku: SKU;
  name: string;
  description: string;
  unitPrice: Money;
  stockQuantity: Quantity;
  reorderThreshold: Quantity;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity — Product
 *
 * Represents a physical item tracked in the warehouse.
 * Owns all invariants related to product identity, pricing, and stock levels.
 */
export class Product {
  private readonly _id: ProductId;
  private readonly _sku: SKU;
  private _name: string;
  private _description: string;
  private _unitPrice: Money;
  private _stockQuantity: Quantity;
  private _reorderThreshold: Quantity;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ProductProps) {
    this.validateName(props.name);
    this._id = props.id;
    this._sku = props.sku;
    this._name = props.name;
    this._description = props.description;
    this._unitPrice = props.unitPrice;
    this._stockQuantity = props.stockQuantity;
    this._reorderThreshold = props.reorderThreshold;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: ProductProps): Product {
    return new Product(props);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get id(): ProductId {
    return this._id;
  }

  get sku(): SKU {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get stockQuantity(): Quantity {
    return this._stockQuantity;
  }

  get reorderThreshold(): Quantity {
    return this._reorderThreshold;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ─── Domain Behaviours ─────────────────────────────────────────────────────

  /** Increases stock (e.g. after receiving a shipment). */
  receiveStock(amount: Quantity): void {
    this._stockQuantity = this._stockQuantity.add(amount);
    this._updatedAt = new Date();
  }

  /** Decreases stock (e.g. after a sales order is fulfilled). */
  dispatchStock(amount: Quantity): void {
    if (!this._stockQuantity.isGreaterThanOrEqualTo(amount)) {
      throw new Error(
        `Insufficient stock for product "${this._name}": ` +
          `requested ${amount.value}, available ${this._stockQuantity.value}`,
      );
    }
    this._stockQuantity = this._stockQuantity.subtract(amount);
    this._updatedAt = new Date();
  }

  /** Returns true when stock is at or below the reorder threshold. */
  needsReorder(): boolean {
    return !this._stockQuantity.isGreaterThanOrEqualTo(this._reorderThreshold);
  }

  /** Updates product metadata. */
  updateDetails(name: string, description: string): void {
    this.validateName(name);
    this._name = name;
    this._description = description;
    this._updatedAt = new Date();
  }

  /** Updates the unit price. */
  updatePrice(newPrice: Money): void {
    this._unitPrice = newPrice;
    this._updatedAt = new Date();
  }

  // ─── Private Invariants ────────────────────────────────────────────────────

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters long');
    }
    if (name.trim().length > 200) {
      throw new Error('Product name must not exceed 200 characters');
    }
  }
}
