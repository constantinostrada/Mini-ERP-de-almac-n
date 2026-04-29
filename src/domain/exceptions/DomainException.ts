/**
 * Base class for all domain-layer exceptions.
 * Allows infrastructure and interfaces layers to distinguish
 * domain errors from unexpected technical failures.
 */
export class DomainException extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainException';
    this.code = code;
    // Restores prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProductNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Product not found: "${identifier}"`, 'PRODUCT_NOT_FOUND');
    this.name = 'ProductNotFoundException';
  }
}

export class DuplicateSkuException extends DomainException {
  constructor(sku: string) {
    super(`A product with SKU "${sku}" already exists`, 'DUPLICATE_SKU');
    this.name = 'DuplicateSkuException';
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productName: string, requested: number, available: number) {
    super(
      `Insufficient stock for "${productName}": requested ${requested}, available ${available}`,
      'INSUFFICIENT_STOCK',
    );
    this.name = 'InsufficientStockException';
  }
}

export class SupplierNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Supplier not found: "${id}"`, 'SUPPLIER_NOT_FOUND');
    this.name = 'SupplierNotFoundException';
  }
}
