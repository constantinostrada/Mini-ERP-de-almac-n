'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { ProductDTO } from '@/application/dtos/ProductDTO';
import type { ProductMovementHistoryItemDTO } from '@/application/dtos/ProductMovementHistoryDTO';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

const MOVEMENT_TYPE_LABELS: Record<ProductMovementHistoryItemDTO['type'], string> = {
  INBOUND: 'Entrada',
  OUTBOUND: 'Salida',
  ADJUSTMENT: 'Ajuste',
};

const MOVEMENT_TYPE_BADGES: Record<ProductMovementHistoryItemDTO['type'], string> = {
  INBOUND: 'badge badge--success',
  OUTBOUND: 'badge badge--warning',
  ADJUSTMENT: 'badge badge--info',
};

/**
 * Products list page — /products
 *
 * Fetches the catalogue from GET /api/products and, when a product is
 * selected, shows its stock movement history from
 * GET /api/products/:id/movements.
 */
export default function ProductsPage(): ReactNode {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductDTO | null>(null);
  const [movements, setMovements] = useState<ProductMovementHistoryItemDTO[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsError, setMovementsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((res) => res.json() as Promise<ApiResponse<ProductDTO[]>>)
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setProducts(json.data);
        } else {
          setProductsError(json.error?.message ?? 'No se pudo cargar el catálogo');
        }
      })
      .catch(() => {
        if (!cancelled) setProductsError('No se pudo cargar el catálogo');
      });
    return (): void => {
      cancelled = true;
    };
  }, []);

  const selectProduct = useCallback((product: ProductDTO): void => {
    setSelected(product);
    setMovements([]);
    setMovementsError(null);
    setMovementsLoading(true);
    fetch(`/api/products/${product.id}/movements`)
      .then((res) => res.json() as Promise<ApiResponse<ProductMovementHistoryItemDTO[]>>)
      .then((json) => {
        if (json.success && json.data) {
          setMovements(json.data);
        } else {
          setMovementsError(json.error?.message ?? 'No se pudo cargar el historial');
        }
      })
      .catch(() => setMovementsError('No se pudo cargar el historial'))
      .finally(() => setMovementsLoading(false));
  }, []);

  return (
    <div>
      <h2 className="section-title">Productos</h2>
      <p className="section-subtitle">
        Gestión del catálogo de productos del almacén. Selecciona un producto para ver su
        historial de movimientos.
      </p>

      <div className="card">
        {productsError && <p style={{ color: 'var(--color-warning)' }}>{productsError}</p>}
        {!productsError && products.length === 0 && (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No hay productos registrados. Crea uno con <code>POST /api/products</code>.
          </p>
        )}
        {products.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <button type="button" onClick={() => selectProduct(product)}>
                        {selected?.id === product.id ? 'Seleccionado' : 'Ver historial'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <h3 className="section-title">Historial de movimientos — {selected.name}</h3>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/movements/export';
              }}
            >
              Export CSV
            </button>
          </div>
          {movementsLoading && <p style={{ color: 'var(--color-muted)' }}>Cargando historial…</p>}
          {movementsError && <p style={{ color: 'var(--color-warning)' }}>{movementsError}</p>}
          {!movementsLoading && !movementsError && movements.length === 0 && (
            <p style={{ color: 'var(--color-muted)' }}>
              Este producto todavía no tiene movimientos registrados.
            </p>
          )}
          {movements.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {movements.map((movement) => (
                <li
                  key={movement.id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--color-border, #e5e7eb)',
                  }}
                >
                  <span style={{ color: 'var(--color-muted)', minWidth: '11rem' }}>
                    {new Date(movement.date).toLocaleString()}
                  </span>
                  <span className={MOVEMENT_TYPE_BADGES[movement.type]}>
                    {MOVEMENT_TYPE_LABELS[movement.type]}
                  </span>
                  <span>Cantidad: {movement.quantity}</span>
                  <span>Stock resultante: {movement.resultingStock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
