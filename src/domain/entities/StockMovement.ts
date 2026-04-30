import type { Money } from '../value-objects/Money';
import type { ProductId } from '../value-objects/ProductId';
import type { Quantity } from '../value-objects/Quantity';

export type MovementType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';

export interface StockMovementProps {
  id: string;
  productId: ProductId;
  type: MovementType;
  quantity: Quantity;
  unitCost?: Money;
  reason?: string;
  reference?: string;
  occurredAt: Date;
}

/**
 * Entity — StockMovement
 *
 * An immutable audit record of every stock change in the warehouse.
 * Inbound: received goods. Outbound: dispatched goods. Adjustment: corrections.
 */
export class StockMovement {
  private readonly _id: string;
  private readonly _productId: ProductId;
  private readonly _type: MovementType;
  private readonly _quantity: Quantity;
  private readonly _unitCost: Money | undefined;
  private readonly _reason: string | undefined;
  private readonly _reference: string | undefined;
  private readonly _occurredAt: Date;

  private constructor(props: StockMovementProps) {
    if (props.quantity.value <= 0) {
      throw new Error('StockMovement quantity must be greater than zero');
    }
    this._id = props.id;
    this._productId = props.productId;
    this._type = props.type;
    this._quantity = props.quantity;
    this._unitCost = props.unitCost;
    this._reason = props.reason?.trim() ? props.reason.trim() : undefined;
    this._reference = props.reference;
    this._occurredAt = props.occurredAt;
  }

  static create(props: StockMovementProps): StockMovement {
    return new StockMovement(props);
  }

  get id(): string {
    return this._id;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get type(): MovementType {
    return this._type;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get unitCost(): Money | undefined {
    return this._unitCost;
  }

  get totalCost(): Money | undefined {
    return this._unitCost?.multiply(this._quantity.value);
  }

  get reason(): string | undefined {
    return this._reason;
  }

  get reference(): string | undefined {
    return this._reference;
  }

  get occurredAt(): Date {
    return this._occurredAt;
  }
}
