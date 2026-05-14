import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Mini-ERP de almacén',
  description: 'Warehouse management system — built with Next.js and Clean Architecture',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="header__inner">
            <span className="header__logo">📦</span>
            <h1 className="header__title">Mini-ERP de almacén</h1>
            <nav className="header__nav">
              <a href="/">Dashboard</a>
              <a href="/products">Productos</a>
              <a href="/suppliers">Proveedores</a>
              <a href="/valuation">Valoración</a>
              <a href="/expenses/new">Nuevo gasto</a>
            </nav>
          </div>
        </header>
        <main className="main">{children}</main>
        <footer className="footer">
          <p>Mini-ERP de almacén · Clean Architecture · Next.js + TypeScript</p>
        </footer>
      </body>
    </html>
  );
}
