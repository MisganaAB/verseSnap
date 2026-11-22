# VerseSnap Engineering & API Conventions

All contributors across backend, frontend, and Telegram bot streams must adhere strictly to these conventions.

---

## 1. Conventions Matrix

| Category | Standard / Rule | Details & Enforcement |
| :--- | :--- | :--- |
| **Backend Module System** | CommonJS (`require` / `module.exports`) | No `"type": "module"` in `backend/package.json`. No ESM imports in backend. |
| **Frontend Module System** | ES Modules (`import` / `export`) | Standard Vite + React 18 configuration. No `require()` in frontend files. |
| **HTTP Client (Frontend)** | Native `fetch()` wrapper only | **No Axios allowed.** All requests routed through `@/services/api.js`. |
| **Database ORM** | Prisma 6 | `backend/prisma/schema.prisma` is the single source of truth for the schema. |
| **Migrations Ownership** | Single Owner (Backend Lead) | Only the Backend Lead creates and merges migrations (`npx prisma migrate dev`). |
| **Migration Mutability** | Strictly Immutable | Migrations are **never edited after merge**. Any change must be a new forward migration. |
| **API Envelope (Success)** | `{ success: true, message, data }` | Enforced by `backend/src/utils/response.js` `sendSuccess`. |
| **API Envelope (Error)** | `{ success: false, message, errors }` | Enforced by `backend/src/utils/response.js` `sendError`. |
| **Input Validation** | Zod (Backend) | Request bodies and query parameters validated with Zod schemas in middleware/controllers. |
| **Casing: API / JSON** | `camelCase` | All JSON keys in HTTP request/response payloads use `camelCase`. |
| **Casing: Database** | `snake_case` | PostgreSQL tables and columns use `snake_case` via Prisma `@@map` and `@map`. |
| **Casing Mapping** | Repository / Service Layer | Map DB snake_case to API camelCase before returning response objects. |
| **Date & Time** | ISO 8601 UTC & Local Dates | All timestamps stored as UTC (`@db.Timestamptz(6)`). Calendar dates stored as `@db.Date`. |
| **CORS Policy** | Whitelisted Origin + Credentials | Explicit `origin: FRONTEND_URL` and `credentials: true`. No wildcard `*`. |
| **Security Headers** | Helmet | Preconfigured in `app.js` with standard security defaults. |
| **CSRF Strategy** | Cookie + SameSite + Token | HttpOnly SameSite=Lax/Strict session cookies. CSRF token middleware placeholder in `app.js` for state-changing routes. |

---

## 2. Layer Responsibilities

```
[Request] ──► [requestId middleware] (attaches UUID to req.id, sets X-Request-Id)
          ──► [security middleware] (helmet, cors, express.json)
          ──► [routes] (mounts endpoints at /api/v1/*)
          ──► [controller] (validates schema with Zod, passes clean data to service)
          ──► [service] (executes core business logic, coordinates DB transactions)
          ──► [Prisma client] (executes queries on PostgreSQL)
          ──► [response helper] (formats output into standard envelope)
```

### 2.1 Error Handling Rule
- Throw `ApiError(statusCode, message, code, details)` in services or controllers.
- Uncaught exceptions bubble to `backend/src/middleware/errorHandler.js`.
- In production (`NODE_ENV === 'production'`), internal database errors and stack traces are suppressed, returning a sanitized 500 error envelope.

### 2.2 Security & CSRF
- During initial bootstrap, CORS is configured with `credentials: true` and the frontend origin `http://localhost:5173`.
- In production, session tokens will reside in `HttpOnly`, `SameSite=Lax` cookies.
- A placeholder for CSRF protection token validation is noted in `backend/src/app.js` before mutating routes are processed.
