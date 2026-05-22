# DMS Dashboard Documentation

Last updated: 2026-02-14

## 1. Project Overview

DMS Dashboard is a Next.js 15 application used to manage recycling cooperative operations, including:

- manager authentication
- worker lifecycle management
- materials and groups management
- buyer and sales management
- stock visibility
- worker productivity analytics

The current backend is SQL-first (Prisma + PostgreSQL), with some legacy Mongo-oriented files kept in the repository for migration compatibility.

## 2. Current Architecture

### Frontend

- Next.js App Router (`src/app`)
- React 19
- Tailwind CSS v4
- Chart.js + react-chartjs-2

### Backend

- Next.js route handlers under `src/app/api/**/route.ts`
- Prisma Client for database access
- JWT cookie auth (`auth_token`)
- bcrypt for password verification/hashing

### Data Layer

- Primary: PostgreSQL (`DATABASE_URL`)
- Prisma schema: `prisma/schema.prisma`
- Seed script: `prisma/seed.ts`

### Legacy Compatibility (not primary path)

- `src/lib/mongodb.ts`
- `src/models/index.ts`

These files are not the active backend path for the main APIs documented below.

## 3. Environment Variables

Use `.env.local` (see `env.example`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dms_db?schema=public"
JWT_SECRET="replace-with-strong-secret"

# Optional legacy variables
MONGODB_URI="mongodb://user:password@localhost:27017/DMS"
MONGODB_DB="DMS"
```

Notes:
- `DATABASE_URL` is required for all active APIs.
- `JWT_SECRET` must be strong in production.
- `MONGODB_*` variables are optional and only relevant to legacy helper code.

## 4. Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL

### Install and run

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed   # optional
npm run dev
```

App URL: `http://localhost:3000`

## 5. Main User Flows

### Authentication

- Login is done via CPF + password (`POST /api/auth/login`).
- Only manager users (`userType = 0`) can access the dashboard.
- Successful login stores an `auth_token` HTTP-only cookie.

### Worker Management

- Create, update, and delete users via `/manage-workers`.
- Worker display IDs (`WP###`) are derived from SQL `Worker_id`.

### Materials and Groups

- Manage materials at `/materials`.
- Groups are auto-created when creating/updating a material with a new group name.

### Sales and Stock

- Create/edit/delete sales at `/sales`.
- Stock is validated before sale creation/update.
- Stock quantities are updated immediately after sale operations.

### Productivity

- `/worker-productivity` shows weekly worker contributions.
- Admin can trigger recalculation from dashboard via `POST /api/recalculate-contributions`.

## 6. Database Model Snapshot

Main Prisma models:

- `Cooperative`
- `Workers`
- `Materials`
- `Groups`
- `Measurments` (legacy spelling preserved)
- `WorkerContributions`
- `Stock`
- `Sales`
- `Buyers`
- `Devices`

Important fields:

- `Workers.User_type` is stored as char/string (`0`, `1`, `W`, `C`, etc.).
- `Workers.CPF`, `PIS`, `RG`, and `Password` are stored as `bytea` and decoded in API helpers.
- `Worker_contributions.Period` is a PostgreSQL `daterange`.

## 7. Auth and Authorization Notes

### Middleware (`src/middleware.ts`)

- Protects all non-public routes.
- Public routes: `/login`, `/api/auth/login`, `/api/auth/*`.
- For protected routes, middleware validates token format (3-part JWT string).

### API-level checks

- Sensitive operations (for example sales write operations) perform full JWT verification in route handlers.
- Login endpoint restricts access to manager users.

## 8. API Reference

### 8.1 Authentication

### `POST /api/auth/login`

Body:

```json
{
  "cpf": "12345678901",
  "password": "manager123"
}
```

Behavior:
- Validates CPF and password
- Requires manager role
- Sets `auth_token` cookie
- Returns user payload for local storage

### `POST /api/auth/logout`

Behavior:
- Deletes `auth_token` cookie

### 8.2 Users and Profile

### `GET /api/users`

Returns worker users only (catadores), normalized for frontend usage.

### `GET /api/users/all`

Returns all users (workers and managers), normalized.

### `POST /api/users/create`

Creates user with hashed password and required identity fields.

Required fields:
- `full_name`
- `CPF`
- `password`
- `birth_date`
- `enter_date`
- `cooperative_id`
- `PIS`
- `RG`

### `POST /api/users/update`

Updates user data. Optional password update when provided.

### `POST /api/users/delete`

Deletes user if not referenced by:
- `Sales`
- `Measurments`
- `Worker_contributions`

### `POST /api/users/assign-wastepicker-ids`

SQL-mode compatibility endpoint.
- Returns computed `WP###` assignments
- Does not persist updates

### `GET /api/user?id=<id>|cpf=<cpf>`

Returns a single user profile by ID or CPF.

### `POST /api/user/update`

Updates logged user profile details.

### `POST /api/user/change-password`

Changes user password after validating current password.

### 8.3 Cooperatives

### `GET /api/cooperatives`

Returns all cooperatives in frontend-friendly shape.

### `POST /api/cooperatives`

Creates a new cooperative.

Body:

```json
{
  "name": "Cooperative Name"
}
```

### 8.4 Materials

### `GET /api/materials`

Returns:
- synthetic group records
- material records

Material objects include:
- `_id`
- `material_id`
- `material` / `name`
- `group`

### `POST /api/materials`

Creates material and creates group if needed.

### `PUT /api/materials/[id]`

Updates material name/group.

### `DELETE /api/materials/[id]`

Deletes material only if no references exist in:
- measurements
- sales
- stock
- worker contributions

### 8.5 Stock

### `GET /api/stock`

Query params:
- `material_id` optional
- supports `group_<group-name>` filtering

Returns material-name keyed object with available stock values.

### 8.6 Sales and Buyers

### `GET /api/sales`

Optional filters:
- `material_id`
- `cooperative_id`
- `start_date`
- `end_date`
- `limit`

Returns:
- `sales[]`
- `summary` (count, total weight, total value)

### `POST /api/sales`

Creates sale and decrements stock after validation.

Required body fields:
- `material_id`
- `price/kg`
- `weight_sold`
- `date`
- `Buyer`

### `PUT /api/sales/[id]`

Updates sale (same manager only), validates stock delta, updates stock totals.

### `DELETE /api/sales/[id]`

Deletes sale (same manager only), restores stock.

### `GET /api/sales/buyers`

Returns buyer names list.

### `POST /api/sales/buyers`

Adds new buyer name if unique.

### Important routing note

`src/app/api/sales/route.ts` contains legacy `PUT`/`DELETE` code from a Mongo implementation.
Current frontend operations use `PUT`/`DELETE` on `/api/sales/[id]`.

### 8.7 Analytics

### `GET /api/worker-productivity`

Query params:
- `worker_id` (required)
- `weeks` (default `12`)

Returns:
- `weeklyContributions`
- `stats`

### `GET /api/worker-collections`

Query params:
- `worker_id` optional
- `material_id` optional
- `period_type` (`weekly`, `monthly`, `yearly`)

Returns top workers by collected weight.

### `GET /api/earnings-comparison`

Query params:
- `material_id` optional
- `period_type` (`weekly`, `monthly`, `yearly`)

Returns earnings for last 6 periods.

### `GET /api/price-fluctuation`

Query params:
- `material_id` optional
- supports single material or `group_<name>`

Returns price timeline data series.

### `GET /api/birthdays`

Returns current-month worker birthdays (worker user types only).

### `POST /api/recalculate-contributions`

Rebuilds weekly worker contributions from measurements and stores results in SQL table `Worker_contributions`.

### 8.8 Debug Endpoints

### `GET /api/debug/check-data`

Returns sample rows and counts from key tables.

### `GET /api/debug/collections`

Returns first sample records across major tables.

### `GET /api/debug/wastepickers`

Returns worker lookup checks and model list.

### `GET /api/debug/create-test-user`

Creates/updates test worker in non-production mode only.

## 9. Frontend Route to API Mapping

- `/login`
- `/api/auth/login`

- `/`
- `/api/materials`
- `/api/users`
- `/api/stock`
- `/api/earnings-comparison`
- `/api/worker-collections`
- `/api/price-fluctuation`
- `/api/birthdays`
- `/api/recalculate-contributions`
- `/api/users/assign-wastepicker-ids`
- `/api/debug/check-data`

- `/worker-productivity`
- `/api/users`
- `/api/materials`
- `/api/worker-productivity`

- `/materials`
- `/api/materials`
- `/api/materials/[id]`

- `/manage-workers`
- `/api/users/all`
- `/api/users/create`
- `/api/users/update`
- `/api/users/delete`
- `/api/cooperatives`

- `/sales`
- `/api/sales`
- `/api/sales/[id]`
- `/api/sales/buyers`
- `/api/materials`
- `/api/cooperatives`
- `/api/stock`

- `/profile`
- `/api/user`
- `/api/user/update`
- `/api/user/change-password`

## 10. Repository Structure (High Level)

- `src/app` - pages and API routes
- `src/components` - shared UI components
- `src/lib` - prisma client and DB utility helpers
- `prisma/schema.prisma` - SQL schema mapping
- `prisma/seed.ts` - seed data script
- `New_db_schema.sql` - SQL schema export snapshot
- `DOCUMENTATION.md` - this technical document
- `PRODUCTIVITY_README.md` - productivity module deep dive

## 11. Operational Caveats

- Many UI labels and API messages are in Portuguese.
- Middleware checks token structure, while full validation happens in route handlers.
- Some legacy migration code remains in the repository and should not be considered the source of truth for active flows.

## 12. Additional References

- Project overview: `README.md`
- Productivity details: `PRODUCTIVITY_README.md`
- Prisma models: `prisma/schema.prisma`
- Seed data: `prisma/seed.ts`

