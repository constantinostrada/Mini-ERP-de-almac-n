// Entities
export { Product } from './entities/Product';
export type { ProductProps } from './entities/Product';
export { StockMovement } from './entities/StockMovement';
export type { StockMovementProps, MovementType } from './entities/StockMovement';
export { Supplier } from './entities/Supplier';
export type { SupplierProps } from './entities/Supplier';

// Value Objects
export { ProductId } from './value-objects/ProductId';
export { Quantity } from './value-objects/Quantity';
export { Money } from './value-objects/Money';
export { SKU } from './value-objects/SKU';

// Repository Interfaces
export type { IProductRepository } from './repositories/IProductRepository';
export type { IStockMovementRepository } from './repositories/IStockMovementRepository';
export type { ISupplierRepository } from './repositories/ISupplierRepository';

// Domain Services
export { StockValuationService } from './services/StockValuationService';
export type { ProductValuation, WarehouseValuationResult } from './services/StockValuationService';

// Exceptions
export {
  DomainException,
  ProductNotFoundException,
  DuplicateSkuException,
  InsufficientStockException,
  SupplierNotFoundException,
} from './exceptions/DomainException';
