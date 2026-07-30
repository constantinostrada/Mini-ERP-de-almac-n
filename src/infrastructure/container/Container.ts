import { AdjustStockUseCase } from '@/application/use-cases/stock/AdjustStockUseCase';
import { GetLowStockProductsUseCase } from '@/application/use-cases/stock/GetLowStockProductsUseCase';
import { GetStockMovementsUseCase } from '@/application/use-cases/stock/GetStockMovementsUseCase';
import { ListPublicMovementsUseCase } from '@/application/use-cases/stock/ListPublicMovementsUseCase';
import { RegisterMovementUseCase } from '@/application/use-cases/stock/RegisterMovementUseCase';
import { CreateProductUseCase } from '@/application/use-cases/product/CreateProductUseCase';
import { DeleteProductUseCase } from '@/application/use-cases/product/DeleteProductUseCase';
import { GetProductByIdUseCase } from '@/application/use-cases/product/GetProductByIdUseCase';
import { ListProductsUseCase } from '@/application/use-cases/product/ListProductsUseCase';
import { UpdateProductUseCase } from '@/application/use-cases/product/UpdateProductUseCase';
import { CreateSupplierUseCase } from '@/application/use-cases/supplier/CreateSupplierUseCase';
import { DeleteSupplierUseCase } from '@/application/use-cases/supplier/DeleteSupplierUseCase';
import { GetSupplierByIdUseCase } from '@/application/use-cases/supplier/GetSupplierByIdUseCase';
import { ListSuppliersUseCase } from '@/application/use-cases/supplier/ListSuppliersUseCase';
import { UpdateSupplierUseCase } from '@/application/use-cases/supplier/UpdateSupplierUseCase';
import { GetWarehouseValuationUseCase } from '@/application/use-cases/valuation/GetWarehouseValuationUseCase';

import { InMemoryMutex } from '../concurrency/InMemoryMutex';
import { UuidGenerator } from '../id/UuidGenerator';
import { InMemoryProductRepository } from '../repositories/InMemoryProductRepository';
import { InMemoryStockMovementRepository } from '../repositories/InMemoryStockMovementRepository';
import { InMemorySupplierRepository } from '../repositories/InMemorySupplierRepository';

/**
 * Dependency Injection Container
 *
 * Wires infrastructure implementations to application use cases.
 * This is the only place where concrete classes are instantiated.
 * No domain or application layer knows about this file.
 *
 * In production, replace in-memory repositories with real DB implementations.
 */
class Container {
  // ─── Shared singletons ────────────────────────────────────────────────────
  readonly idGenerator = new UuidGenerator();
  readonly stockMutex = new InMemoryMutex();
  readonly productRepository = new InMemoryProductRepository();
  readonly stockMovementRepository = new InMemoryStockMovementRepository();
  readonly supplierRepository = new InMemorySupplierRepository();

  // ─── Use Cases — Products ─────────────────────────────────────────────────
  readonly createProduct = new CreateProductUseCase(
    this.productRepository,
    this.idGenerator,
  );

  readonly getProductById = new GetProductByIdUseCase(this.productRepository);

  readonly listProducts = new ListProductsUseCase(this.productRepository);

  readonly updateProduct = new UpdateProductUseCase(this.productRepository);

  readonly deleteProduct = new DeleteProductUseCase(this.productRepository);

  // ─── Use Cases — Stock ────────────────────────────────────────────────────
  readonly adjustStock = new AdjustStockUseCase(
    this.productRepository,
    this.stockMovementRepository,
    this.idGenerator,
  );

  readonly getStockMovements = new GetStockMovementsUseCase(this.stockMovementRepository);

  readonly getLowStockProducts = new GetLowStockProductsUseCase(this.productRepository);

  readonly registerMovement = new RegisterMovementUseCase(
    this.productRepository,
    this.stockMovementRepository,
    this.idGenerator,
    this.stockMutex,
  );

  readonly listPublicMovements = new ListPublicMovementsUseCase(this.stockMovementRepository);

  // ─── Use Cases — Valuation ────────────────────────────────────────────────
  readonly getWarehouseValuation = new GetWarehouseValuationUseCase(this.productRepository);

  // ─── Use Cases — Suppliers ────────────────────────────────────────────────
  readonly createSupplier = new CreateSupplierUseCase(
    this.supplierRepository,
    this.idGenerator,
  );

  readonly listSuppliers = new ListSuppliersUseCase(this.supplierRepository);

  readonly getSupplierById = new GetSupplierByIdUseCase(this.supplierRepository);

  readonly updateSupplier = new UpdateSupplierUseCase(this.supplierRepository);

  readonly deleteSupplier = new DeleteSupplierUseCase(this.supplierRepository);
}

/**
 * Global singleton container.
 * Next.js hot-reloads in dev, so we attach to globalThis to avoid re-instantiation.
 */
const globalForContainer = globalThis as unknown as { __container?: Container };

export const container: Container =
  globalForContainer.__container ?? new Container();

if (process.env['NODE_ENV'] !== 'production') {
  globalForContainer.__container = container;
}
