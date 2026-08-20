import type { Product } from '../entities/Product';
import type { Supplier } from '../entities/Supplier';
import { Money } from '../value-objects/Money';

export interface ProductValuation {
  productId: string;
  productName: string;
  stockQuantity: number;
  unitPrice: Money;
  totalValue: Money;
}

export interface WarehouseValuationResult {
  lines: ProductValuation[];
  grandTotal: Money;
  currency: string;
}

export interface SupplierValuation {
  supplierId: string;
  supplierName: string;
  productCount: number;
  totalUnits: number;
  totalValue: Money;
}

/**
 * Domain Service — StockValuationService
 *
 * Computes the total monetary value of inventory across multiple products.
 * This logic spans multiple entities, so it lives in a domain service
 * rather than on a single entity.
 */
export class StockValuationService {
  /**
   * Calculates the total warehouse inventory value.
   * All products must share the same currency.
   */
  calculateWarehouseValue(
    products: Product[],
    currency: string,
  ): WarehouseValuationResult {
    if (products.length === 0) {
      return {
        lines: [],
        grandTotal: Money.fromCents(0, currency),
        currency,
      };
    }

    const lines: ProductValuation[] = products.map((product) => {
      const totalValue = product.unitPrice.multiply(product.stockQuantity.value);
      return {
        productId: product.id.value,
        productName: product.name,
        stockQuantity: product.stockQuantity.value,
        unitPrice: product.unitPrice,
        totalValue,
      };
    });

    const grandTotal = lines.reduce(
      (acc, line) => acc.add(line.totalValue),
      Money.fromCents(0, currency),
    );

    return { lines, grandTotal, currency };
  }

  /**
   * Calculates the inventory value grouped by supplier.
   *
   * Each supplier is valued over the products assigned to it, reusing the
   * per-product valuation above. Products without a (known) supplier are
   * not attributed to anyone.
   */
  calculateValueBySupplier(
    suppliers: Supplier[],
    products: Product[],
    currency: string,
  ): SupplierValuation[] {
    return suppliers.map((supplier) => {
      const supplierProducts = products.filter((p) => p.supplierId === supplier.id);
      const valuation = this.calculateWarehouseValue(supplierProducts, currency);
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        productCount: valuation.lines.length,
        totalUnits: valuation.lines.reduce((acc, line) => acc + line.stockQuantity, 0),
        totalValue: valuation.grandTotal,
      };
    });
  }
}
