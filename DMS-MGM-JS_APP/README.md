# DMS Dashboard

DMS Dashboard is a Next.js application for cooperative operations management in waste collection workflows.

It provides:
- secure manager login
- worker and cooperative management
- materials and buyers management
- stock and sales control
- productivity analytics and operational charts

## Latest Project Updates

- Migrated core backend flows to **Prisma + PostgreSQL**.
- Worker tracking IDs are now derived from SQL `Worker_id` using the format `WP###`.
- Sales now update stock (`totalSoldKg` and `currentStockKg`) in real time.
- Worker contribution recalculation now writes to SQL `Worker_contributions` using weekly date ranges.
- Added CRUD APIs for materials, cooperatives, users, and buyers with SQL-backed validation.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- JWT cookie auth + bcrypt password hashing
- Chart.js + react-chartjs-2

## App Routes

- `/login` - manager login
- `/` - operational dashboard
- `/worker-productivity` - worker contribution analytics
- `/materials` - materials and groups management
- `/manage-workers` - workers and managers management
- `/sales` - sales registration, editing, and deletion
- `/profile` - profile update and password change

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` from `env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dms_db?schema=public"
JWT_SECRET="replace-with-strong-secret"
```

Optional legacy variables (only needed by old migration helpers):

```env
MONGODB_URI="mongodb://user:password@localhost:27017/DMS"
MONGODB_DB="DMS"
```

### 3. Push schema

```bash
npx prisma generate
npx prisma db push
```

### 4. (Optional) Seed development data

```bash
npx prisma db seed
```

Seed includes sample manager and worker accounts.

### 5. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Seed Credentials

When using `prisma/seed.ts`:

- Manager login: `CPF 12345678901` / `manager123`
- Worker account: `CPF 98765432100` / `worker123`

Note: only manager users (`userType = 0`) can log in to the dashboard.

## Available Scripts

- `npm run dev` - development server (Turbopack)
- `npm run build` - production build
- `npm run start` - production server
- `npm run lint` - lint checks

## API Overview

See full API and architecture details in:

- [`DOCUMENTATION.md`](./DOCUMENTATION.md)
- [`PRODUCTIVITY_README.md`](./PRODUCTIVITY_README.md)

## Important Notes

- UI text and many API messages are currently in Portuguese, even though this documentation is in English.
- `src/app/api/sales/[id]/route.ts` is the active path for update/delete operations.
- `src/app/api/sales/route.ts` should be treated as GET/POST only.
- Middleware currently validates JWT format on edge routes and full auth validation is enforced by protected API handlers.

## License

This repository includes `LICENSE` at the project root.
