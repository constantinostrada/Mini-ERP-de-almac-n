import type { ReactNode } from 'react';

/**
 * Products list page — /products
 *
 * In a full implementation this would fetch from /api/products
 * using a client component with React state, or use a Server Component
 * that calls the use case directly. Skeleton provided for extension.
 */
export default function ProductsPage(): ReactNode {
  return (
    <div>
      <h2 className="section-title">Productos</h2>
      <p className="section-subtitle">
        Gestión del catálogo de productos del almacén.
      </p>

      <div className="card">
        <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Conecta este componente a <code>GET /api/products</code> para visualizar el catálogo.
          <br />
          Consulta el README para ver ejemplos de peticiones cURL.
        </p>
      </div>
    </div>
  );
}
