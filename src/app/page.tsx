import type { ReactNode } from 'react';

/**
 * Dashboard page — /
 *
 * Server Component that renders the application landing page.
 * Data fetching would be done via Server Components calling use cases directly,
 * or via client-side fetch to the API routes.
 */
export default function DashboardPage(): ReactNode {
  return (
    <div>
      <div className="hero">
        <div className="hero__emoji">📦</div>
        <h2 className="hero__title">Mini-ERP de almacén</h2>
        <p className="hero__sub">
          Sistema de gestión de almacén construido con Next.js y Clean Architecture
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Productos</div>
          <div className="stat-card__value stat-card__value--success">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Stock bajo</div>
          <div className="stat-card__value stat-card__value--warning">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Proveedores</div>
          <div className="stat-card__value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Valor del inventario</div>
          <div className="stat-card__value">—</div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Endpoints de API disponibles</h3>
        <p className="section-subtitle">
          Todos los endpoints respetan el contrato <code>&#123; success, data &#125;</code> /
          <code> &#123; success, error &#125;</code>.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Método</th>
                <th>Endpoint</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/products</code></td>
                <td>Listar todos los productos</td>
              </tr>
              <tr>
                <td><span className="method method--post">POST</span></td>
                <td><code className="endpoint">/api/products</code></td>
                <td>Crear un nuevo producto</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/products/[id]</code></td>
                <td>Obtener producto por ID</td>
              </tr>
              <tr>
                <td><span className="method method--put">PUT</span></td>
                <td><code className="endpoint">/api/products/[id]</code></td>
                <td>Actualizar producto</td>
              </tr>
              <tr>
                <td><span className="method method--delete">DELETE</span></td>
                <td><code className="endpoint">/api/products/[id]</code></td>
                <td>Eliminar producto</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/products/low-stock</code></td>
                <td>Productos por debajo del umbral de reabastecimiento</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/products/[id]/stock</code></td>
                <td>Historial de movimientos de stock</td>
              </tr>
              <tr>
                <td><span className="method method--post">POST</span></td>
                <td><code className="endpoint">/api/products/[id]/stock</code></td>
                <td>Registrar movimiento de stock (entrada/salida/ajuste)</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/suppliers</code></td>
                <td>Listar proveedores</td>
              </tr>
              <tr>
                <td><span className="method method--post">POST</span></td>
                <td><code className="endpoint">/api/suppliers</code></td>
                <td>Registrar proveedor</td>
              </tr>
              <tr>
                <td><span className="method method--get">GET</span></td>
                <td><code className="endpoint">/api/valuation?currency=USD</code></td>
                <td>Valoración total del inventario</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
