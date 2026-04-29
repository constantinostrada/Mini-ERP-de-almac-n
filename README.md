# 📦 Mini-ERP de almacén

A production-ready warehouse management system (mini-ERP) built with **Next.js 14**, **TypeScript**, and **Clean Architecture**.

---

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Clean Architecture Layers](#clean-architecture-layers)
6. [API Reference](#api-reference)
7. [Running Tests](#running-tests)
8. [Linting & Formatting](#linting--formatting)
9. [Environment Variables](#environment-variables)
10. [Extending the Project](#extending-the-project)

---

## Project Description

**Mini-ERP de almacén** tracks warehouse inventory: products, stock movements (inbound deliveries, outbound dispatches, adjustments), suppliers, and real-time inventory valuation.

Core features:

| Feature | Description |
|---|---|
| Product catalog | Create, read, update, delete warehouse products with SKU, price, and stock |
| Stock management | Record inbound / outbound / adjustment movements with full audit trail |
| Reorder alerts | Identify products below their configurable reorder threshold |
| Inventory valuation | Compute total monetary value of stock across all products |
| Supplier registry | Register and list external suppliers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) (strict mode) |
| Testing | [Jest](https://jestjs.io) + ts-jest |
| Linting | ESLint + `@typescript-eslint` |
| Formatting | Prettier |
| IDs | `uuid` v4 |
| Persistence | In-memory (swap for Prisma / Drizzle / any ORM in infrastructure) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (or pnpm / yarn)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
.
├── src/
│   ├── domain/               ← Business rules (no external dependencies)
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/     ← Interfaces only
│   │   ├── services/
│   │   └── exceptions/
│   │
│   ├── application/          ← Use cases & orchestration
│   │   ├── dtos/
│   │   ├── mappers/
│   │   ├── ports/            ← Abstractions for infrastructure
│   │   └── use-cases/
│   │       ├── product/
│   │       ├── stock/
│   │       ├── supplier/
│   │       └── valuation/
│   │
│   ├── infrastructure/       ← Concrete implementations & I/O
│   │   ├── container/        ← Dependency injection wiring
│   │   ├── id/
│   │   └── repositories/     ← In-memory (replace with DB)
│   │
│   ├── interfaces/           ← HTTP helpers (controllers)
│   │   └── api/
│   │       └── helpers/
│   │
│   └── app/                  ← Next.js App Router
│       ├── api/              ← Route handlers (call use cases)
│       │   ├── products/
│       │   ├── suppliers/
│       │   └── valuation/
│       ├── products/
│       ├── suppliers/
│       ├── valuation/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
│
├── CLAUDE.md                 ← Architecture contract
├── architecture.json         ← Machine-readable layer rules
├── jest.config.ts
├── next.config.ts
├── tsconfig.json
├── .eslintrc.json
└── .prettierrc
```

---

## Clean Architecture Layers

This project follows **Clean Architecture** by Robert C. Martin. Dependencies always point **inward** — outer layers know about inner layers, never the reverse.

```
┌─────────────────────────────────────────────┐
│  interfaces / app (Next.js routes & pages)  │
│  ┌───────────────────────────────────────┐  │
│  │         application (use cases)       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │        domain (core rules)      │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│  infrastructure (DB, UUID, HTTP clients)     │
└─────────────────────────────────────────────┘
```

### `src/domain/` — The Core

Contains **all business rules**. Has zero knowledge of frameworks, databases, or HTTP.

- **Entities** (`Product`, `StockMovement`, `Supplier`) — objects with identity and lifecycle. They protect their own invariants inside constructors and methods.
- **Value Objects** (`ProductId`, `SKU`, `Quantity`, `Money`) — immutable, equality by value.
- **Repository Interfaces** (`IProductRepository`, etc.) — describe *what* persistence operations exist; never *how* they work.
- **Domain Services** (`StockValuationService`) — logic that spans multiple entities.
- **Exceptions** (`DomainException`, `ProductNotFoundException`, etc.) — typed domain errors.

> ❌ `domain/` **never** imports from `application/`, `infrastructure/`, or `interfaces/`.

### `src/application/` — Use Cases

Orchestrates domain objects to fulfill one specific user action. Knows **what** to do, never **how** (no SQL, no HTTP calls).

- **Use Cases** (`CreateProductUseCase`, `AdjustStockUseCase`, etc.) — one class per action, one `execute(dto)` method.
- **DTOs** — plain data contracts for use case input and output. Domain entities never escape this boundary.
- **Mappers** — convert between domain entities and DTOs.
- **Ports** (`IIdGenerator`) — abstractions for infrastructure capabilities needed by use cases.

> ❌ `application/` **never** imports from `infrastructure/` or `interfaces/`.

### `src/infrastructure/` — Implementations

Implements interfaces defined in domain/application. All I/O lives here.

- **Repository implementations** (`InMemoryProductRepository`, etc.) — swap these for Prisma/Drizzle in production.
- **Adapters** (`UuidGenerator`) — wraps third-party libraries behind clean interfaces.
- **Container** (`Container.ts`) — the single place where concrete classes are wired together (poor-man's DI container).

> ❌ `infrastructure/` **never** imports from `interfaces/`.

### `src/interfaces/` + `src/app/api/` — Entry Points

Translates external HTTP requests into use case calls, and use case output into JSON responses.

- **Route handlers** (`/api/products`, `/api/suppliers`, etc.) — thin: validate input → call use case → serialize output.
- **API helpers** (`apiResponse.ts`, `parseBody.ts`) — shared response builders and error mappers.
- **Pages** (`/products`, `/suppliers`, etc.) — Next.js Server Components / client pages.

> ❌ Controllers **never** contain business logic or call repositories directly.

---

## API Reference

All endpoints return `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`.

### Products

```bash
# List all products
GET /api/products

# Create a product
POST /api/products
Content-Type: application/json
{
  "sku": "BOX-001",
  "name": "Caja de cartón",
  "description": "Caja estándar 40×30×20 cm",
  "unitPriceAmount": 1.99,
  "unitPriceCurrency": "EUR",
  "initialStockQuantity": 500,
  "reorderThreshold": 50
}

# Get a product
GET /api/products/:id

# Update a product
PUT /api/products/:id
Content-Type: application/json
{
  "name": "Caja de cartón reforzada",
  "description": "Versión reforzada",
  "unitPriceAmount": 2.49,
  "unitPriceCurrency": "EUR",
  "reorderThreshold": 40
}

# Delete a product
DELETE /api/products/:id

# Products below reorder threshold
GET /api/products/low-stock
```

### Stock Movements

```bash
# History for a product
GET /api/products/:id/stock

# Record a movement
POST /api/products/:id/stock
Content-Type: application/json
{
  "type": "INBOUND",
  "quantity": 200,
  "unitCostAmount": 1.20,
  "unitCostCurrency": "EUR",
  "reason": "Pedido de compra #PO-2024-07",
  "reference": "PO-2024-07"
}
# type: "INBOUND" | "OUTBOUND" | "ADJUSTMENT"
```

### Suppliers

```bash
# List suppliers
GET /api/suppliers

# Register supplier
POST /api/suppliers
Content-Type: application/json
{
  "name": "Embalajes Ibérica S.L.",
  "contactEmail": "ventas@embalajes-iberica.es",
  "contactPhone": "+34 91 123 45 67",
  "address": "Calle Industrial 14, 28001 Madrid"
}
```

### Inventory Valuation

```bash
# Total warehouse value
GET /api/valuation?currency=EUR
```

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

Tests are co-located with their layer under `__tests__/` directories:

```
src/domain/__tests__/          ← Entity & value object unit tests
src/application/__tests__/     ← Use case integration tests (in-memory repos)
```

---

## Linting & Formatting

```bash
# Lint
npm run lint

# Lint + auto-fix
npm run lint:fix

# Format with Prettier
npm run format

# Check formatting
npm run format:check

# TypeScript type check (no emit)
npm run type-check
```

The ESLint config enforces:
- No `any` types
- Clean Architecture boundary violations (via `import/no-restricted-paths`)
- Import ordering (domain → application → infrastructure → interfaces)
- No circular dependencies

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `DATABASE_URL` | `file:./warehouse.db` | DB connection string (for future persistence layer) |

---

## Extending the Project

### Swap the in-memory persistence for a real database

1. Install Prisma: `npm install prisma @prisma/client`
2. Create `src/infrastructure/repositories/PrismaProductRepository.ts` implementing `IProductRepository`
3. In `Container.ts`, replace `new InMemoryProductRepository()` with `new PrismaProductRepository(prismaClient)`

The application and domain layers require **zero changes**.

### Add a new feature (e.g., Purchase Orders)

1. **Domain**: add `PurchaseOrder` entity + `IPurchaseOrderRepository` interface
2. **Application**: add `CreatePurchaseOrderUseCase`, `GetPurchaseOrderUseCase`, DTOs, mapper
3. **Infrastructure**: add `InMemoryPurchaseOrderRepository` (or Prisma version)
4. **Interfaces**: add `/api/purchase-orders/route.ts` route handler

Each step is isolated — changes in one layer do not ripple outward.
