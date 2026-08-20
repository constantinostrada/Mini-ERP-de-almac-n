'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { SupplierValuationDTO } from '@/application/dtos/SupplierValuationDTO';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Suppliers page — /suppliers
 *
 * Shows the inventory valuation grouped by supplier from
 * GET /api/suppliers/valuation.
 */
export default function SuppliersPage(): ReactNode {
  const [valuation, setValuation] = useState<SupplierValuationDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/suppliers/valuation')
      .then((res) => res.json() as Promise<ApiResponse<SupplierValuationDTO>>)
      .then((json) => {
        if (cancelled) return;
        if (json.success && json.data) {
          setValuation(json.data);
        } else {
          setError(json.error?.message ?? 'No se pudo cargar la valuación por proveedor');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la valuación por proveedor');
      });
    return (): void => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h2 className="section-title">Proveedores</h2>
      <p className="section-subtitle">
        Valor del inventario agrupado por proveedor: productos que provee, unidades en stock y su
        valor monetario total.
      </p>

      <div className="card">
        {error && <p style={{ color: 'var(--color-warning)' }}>{error}</p>}
        {!error && !valuation && <p style={{ color: 'var(--color-muted)' }}>Cargando…</p>}
        {!error && valuation && valuation.lines.length === 0 && (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No hay proveedores registrados. Crea uno con <code>POST /api/suppliers</code>.
          </p>
        )}
        {!error && valuation && valuation.lines.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Productos</th>
                  <th>Unidades</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {valuation.lines.map((line) => (
                  <tr key={line.supplierId}>
                    <td>{line.supplierName}</td>
                    <td>{line.productCount}</td>
                    <td>{line.totalUnits}</td>
                    <td>{formatMoney(line.totalValueAmount, line.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
