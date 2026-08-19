// DTOs
export type { ProductDTO, CreateProductDTO, UpdateProductDTO, AdjustStockDTO, GetProductByIdDTO } from './dtos/ProductDTO';
export type {
  StockMovementDTO,
  GetMovementsByProductDTO,
  PublicMovementType,
  RegisterMovementDTO,
  PublicStockMovementDTO,
  MoneyDTO,
} from './dtos/StockMovementDTO';
export type {
  GetProductMovementHistoryDTO,
  ProductMovementHistoryItemDTO,
} from './dtos/ProductMovementHistoryDTO';
export type {
  SupplierDTO,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  GetSupplierByIdDTO,
} from './dtos/SupplierDTO';
export type { WarehouseValuationDTO, ProductValuationLineDTO } from './dtos/ValuationDTO';

// Ports
export type { IIdGenerator } from './ports/IIdGenerator';
export type { IMutex } from './ports/IMutex';

// Use Cases — Products
export { CreateProductUseCase } from './use-cases/product/CreateProductUseCase';
export { GetProductByIdUseCase } from './use-cases/product/GetProductByIdUseCase';
export { ListProductsUseCase } from './use-cases/product/ListProductsUseCase';
export { UpdateProductUseCase } from './use-cases/product/UpdateProductUseCase';
export { DeleteProductUseCase } from './use-cases/product/DeleteProductUseCase';

// Use Cases — Stock
export { AdjustStockUseCase } from './use-cases/stock/AdjustStockUseCase';
export { GetStockMovementsUseCase } from './use-cases/stock/GetStockMovementsUseCase';
export { GetLowStockProductsUseCase } from './use-cases/stock/GetLowStockProductsUseCase';
export { RegisterMovementUseCase } from './use-cases/stock/RegisterMovementUseCase';
export { ListPublicMovementsUseCase } from './use-cases/stock/ListPublicMovementsUseCase';
export type { ListPublicMovementsDTO } from './use-cases/stock/ListPublicMovementsUseCase';
export { GetProductMovementHistoryUseCase } from './use-cases/stock/GetProductMovementHistoryUseCase';

// Use Cases — Valuation
export { GetWarehouseValuationUseCase } from './use-cases/valuation/GetWarehouseValuationUseCase';
export type { GetWarehouseValuationDTO } from './use-cases/valuation/GetWarehouseValuationUseCase';

// Use Cases — Suppliers
export { CreateSupplierUseCase } from './use-cases/supplier/CreateSupplierUseCase';
export { ListSuppliersUseCase } from './use-cases/supplier/ListSuppliersUseCase';
export { GetSupplierByIdUseCase } from './use-cases/supplier/GetSupplierByIdUseCase';
export { UpdateSupplierUseCase } from './use-cases/supplier/UpdateSupplierUseCase';
export { DeleteSupplierUseCase } from './use-cases/supplier/DeleteSupplierUseCase';

// Mappers
export { ProductMapper } from './mappers/ProductMapper';
export { StockMovementMapper } from './mappers/StockMovementMapper';
export { ProductMovementHistoryMapper } from './mappers/ProductMovementHistoryMapper';
export { SupplierMapper } from './mappers/SupplierMapper';
