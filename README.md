# VerseSnap

VerseSnap is a unified spiritual engagement platform featuring one core product with two front doors: a React web application and a Telegram bot. Both interfaces interact with a single Express backend backed by a PostgreSQL database.

The core feature is a daily verse-posting streak mechanism with a 24-hour free manual restoration grace period. After the free window expires, users can request a paid streak restoration using Telebirr, which is manually verified by an administrator before reinstatement.

---

## Prerequisites

Ensure the following runtimes and services are installed locally:
- **Node.js**: `22.x LTS` (Node 22 is required for both backend and frontend)
- **npm**: `10.x` or higher
- **PostgreSQL**: `16.x`

---

## Project Structure

```
versesnap/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api-contracts.md
│   ├── decisions.md
│   └── API_CONVENTIONS.md
├── backend/                  # Express 5 + Prisma 6 + CommonJS
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
└── frontend/                 # React 18 + Vite 5 + ES Modules
    └── src/
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Copy environment configuration
cp .env.example .env

# Edit .env and configure your PostgreSQL connection string:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/versesnap?schema=public"

# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Generate initial migration (BACKEND LEAD ONLY - see Migration Rules below)
# npx prisma migrate dev --name init
```

### 2. Frontend Setup

```bash
cd frontend

# Copy environment configuration
cp .env.example .env.local

# Install dependencies
npm install
```

---

## Running Development Servers

You can run both services from the project root or from their respective directories.

### From Root:

```bash
# Terminal 1: Run Express backend (http://localhost:5000)
npm run dev:backend

# Terminal 2: Run React Vite frontend (http://localhost:5173)
npm run dev:frontend
```

### From Subdirectories:

```bash
# In backend/
npm run dev

# In frontend/
npm run dev
```

---

## Running Tests & Linters

```bash
# Run tests across both workspaces
npm test

# Run tests individually
npm run test:backend    # Uses Node 22 native test runner
npm run test:frontend   # Uses Vitest

# Run linters across both workspaces
npm run lint

# Run linters individually
npm run lint:backend
npm run lint:frontend
```

---

## Branching Model & Workflow

We follow a strict Git flow convention:

```
main (Production releases only)
  └── develop (Integration branch; PR target for features)
        ├── feature/auth-telegram
        ├── feature/verse-posting
        ├── feature/streak-engine
        └── feature/telebirr-restoration
```

- **`main`**: Represents production-ready code. Directly deployable.
- **`develop`**: Central integration branch. All feature branches branch off `develop` and must be merged into `develop` via Pull Request.
- **`feature/<name>`**: Individual feature branches. Never branch off `main`.

---

## Critical Rules for Prisma Migrations

> [!IMPORTANT]
> **Only the Backend Lead is permitted to generate and merge Prisma migrations.**
> 
> 1. Developers working on feature branches may create draft models in `schema.prisma` for testing in personal development databases, but **must never merge unapproved migration folders** into `develop`.
> 2. The Backend Lead reviews schema changes, coordinates column naming conventions, and executes `npx prisma migrate dev`.
> 3. **Never edit an existing migration file** after it has been merged to `develop`. Any schema adjustments must be introduced as a new forward migration.
> 4. Partial unique indexes and functional indexes (e.g., case-insensitive uniqueness, one open break per user) cannot be expressed in standard Prisma schema syntax and are applied via custom raw-SQL migration steps orchestrated by the Backend Lead. See [docs/database.md](docs/database.md) for details.
