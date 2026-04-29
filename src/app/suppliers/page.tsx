import type { ReactNode } from 'react';

/**
 * Suppliers page — /suppliers
 */
export default function SuppliersPage(): ReactNode {
  return (
    <div>
      <h2 className="section-title">Proveedores</h2>
      <p className="section-subtitle">
        Gestión de los proveedores registrados en el sistema.
      </p>

      <div className="card">
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Conecta este componente a <code>GET /api/suppliers</code> para listar proveedores.
        </p>
      </div>
    </div>
  );
}
