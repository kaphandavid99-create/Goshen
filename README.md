# Goshen Provision

Production e-commerce platform for a premium grocery store. Authentication will be custom — database-backed sessions, hashed passwords, and HTTP-only cookies. Third-party auth providers are not used.

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL (Supabase) + Prisma (browse and edit in the Supabase table editor or `npm run db:studio`)
- **Auth:** Custom sessions, bcrypt password hashes, HTTP-only cookies, CSRF tokens
- **Images (next):** Cloudinary
- **Validation:** Zod
- **Tests (next):** Vitest, Playwright
- **Deploy:** Vercel

## Project structure

```text
src/
  app/            App Router pages and route handlers
  components/     UI and layout components (shadcn/ui in components/ui)
  lib/            Shared utilities, future auth and database helpers
  server/         Server-only modules
  hooks/          React hooks
  stores/         Zustand stores
  types/          Shared TypeScript types
  validators/     Zod schemas
  utils/          Small pure helpers
prisma/           Prisma schema (models added later)
e2e/              Playwright tests (added later)
```

## Getting started

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3005](http://localhost:3005).

`dev` and `build` use webpack. Next.js 16 defaults to Turbopack, which currently fails to load the Tailwind `lightningcss` native binary in this Windows setup.

## Authentication

Custom auth only. Do not add Supabase Auth, Firebase Auth, or Clerk. Supabase is used only as the hosted Postgres database.

1. Create a project at [supabase.com](https://supabase.com). In **Project Settings > Database > Connection string**, copy both the **Transaction pooler** URL (port 6543) and the **Session pooler** URL (port 5432).
2. In `.env` (and on Vercel, same values):
   - `DATABASE_URL` = the 6543 URL, with `?pgbouncer=true&connection_limit=10&pool_timeout=20`. The explicit `connection_limit` matters — without it Prisma pins the pool to 1 and the admin dashboard times out. Don't use the 5432 URL here; it caps at 15 clients.
   - `DIRECT_URL` = the 5432 URL (used only by `prisma migrate` / `prisma studio`).
3. Create the first migration, apply the schema, and seed the catalog:

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. Open `/register` to create an account, or sign in as the seeded admin (`admin@goshen.local` / `GoshenAdmin1!`). Sessions are stored in the database and sent as the `goshen_session` HTTP-only cookie.

After seeding, the Supabase table editor shows `Category`, `Product`, `User`, `Session`, `Order`, and `OrderItem`.

The shop at `/shop` also renders from bundled seed data when the database is empty or unavailable. The basket is stored in the browser with Zustand.

Protected routes (`/account`, `/admin`, `/checkout`) are gated in `src/proxy.ts`. Role checks use `requireRole()` on the server.

The database is required for sign-in, registration, and placing orders. The rest of the site still renders without it.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:seed` | Seed grocery categories and products |
| `npm run db:studio` | Open Prisma Studio |

## Brand

| Token | Hex |
| --- | --- |
| Primary dark green | `#012F25` |
| Cream | `#FAF2A0` |
| Orange | `#FC7D14` |
