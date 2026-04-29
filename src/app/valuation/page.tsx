import type { ReactNode } from 'react';

/**
 * Inventory valuation page — /valuation
 */
export default function ValuationPage(): ReactNode {
  return (
    <div>
      <h2 className="section-title">Valoración del Inventario</h2>
      <p className="section-subtitle">
        Valor monetario total del stock almacenado.
      </p>

      <div className="card">
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Conecta este componente a <code>GET /api/valuation?currency=USD</code> para ver
          el desglose por producto y el total.
        </p>
      </div>
    </div>
  );
}
