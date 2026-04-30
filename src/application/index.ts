// DTOs
export type { ProductDTO, CreateProductDTO, UpdateProductDTO, AdjustStockDTO, GetProductByIdDTO } from './dtos/ProductDTO';
export type {
  StockMovementDTO,
  GetMovementsByProductDTO,
  PublicMovementType,
  RegisterMovementDTO,
  PublicStockMovementDTO,
  MoneyDTO,
  MovementsByTypeReportItemDTO,
} from './dtos/StockMovementDTO';
export type { SupplierDTO, CreateSupplierDTO, UpdateSupplierDTO } from './dtos/SupplierDTO';
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
export { GetMovementsByTypeReportUseCase } from './use-cases/stock/GetMovementsByTypeReportUseCase';
export type { GetMovementsByTypeReportDTO } from './use-cases/stock/GetMovementsByTypeReportUseCase';

// Use Cases — Valuation
export { GetWarehouseValuationUseCase } from './use-cases/valuation/GetWarehouseValuationUseCase';
export type { GetWarehouseValuationDTO } from './use-cases/valuation/GetWarehouseValuationUseCase';

// Use Cases — Suppliers
export { CreateSupplierUseCase } from './use-cases/supplier/CreateSupplierUseCase';
export { ListSuppliersUseCase } from './use-cases/supplier/ListSuppliersUseCase';

// Mappers
export { ProductMapper } from './mappers/ProductMapper';
export { StockMovementMapper } from './mappers/StockMovementMapper';
export { SupplierMapper } from './mappers/SupplierMapper';
