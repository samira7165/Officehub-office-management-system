# OfficeHub — Office / HR Management

A full-stack office management dashboard: employees, attendance, leaves, payroll,
documents, tasks, and departments. Inspired by the Pagedone HR Management Figma
template — purple/indigo theme, sidebar nav, card-based dashboard.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Drizzle ORM ·
TiDB / MySQL (mysql2) · JWT cookie auth (jose) · Recharts · Lucide icons

## Setup

```bash
npm install
# put DATABASE_URL (TiDB connection string) and AUTH_SECRET in .env.local — see .env.example
npm run seed      # creates the tables in TiDB and fills them with sample data
npm run dev        # http://localhost:3000
```

Login with:
- **Admin:** admin@officehub.io / admin123
- **HR:** farzana.yasmin@officehub.io / password123

Re-run `npm run seed` anytime to reset the database back to sample data
(it wipes and reseeds all tables).

## What's included

| Module | What it does |
|---|---|
| Dashboard | Live stats, 7-day attendance chart, department breakdown, recent leaves/tasks |
| Employees | Full CRUD, search, department assignment, status |
| Attendance | Daily check-in/out per employee, date picker, present/late/absent counts |
| Leaves | Request leave, approve/reject (auto-flips employee status to "on leave") |
| Payroll | Generate monthly entries from base salary, bonus/deduction, mark as paid |
| Documents | Track employee/company files by category |
| Tasks | Kanban board (To do / In progress / Done), assignee, priority, due date |
| Departments | Manage departments with live headcount |
| Calendar | Month view showing approved leaves per day |

## Structure

```
app/
  (app)/            # authenticated pages, share the sidebar layout
  api/               # REST-ish API routes per entity
  login/             # public login page
lib/
  schema.ts          # Drizzle table definitions
  db.ts              # TiDB/MySQL connection pool
  auth.ts             # JWT session helpers
scripts/seed.ts       # sample data generator
middleware.ts          # route protection (redirects unauthenticated users)
```

## Production

```bash
npm run build
npm run start
```

On Vercel, set `DATABASE_URL` and `AUTH_SECRET` under Project → Settings →
Environment Variables, then redeploy. Use a real random `AUTH_SECRET` —
the default is a dev-only placeholder.

## Extending

- Add real file uploads for Documents: currently it just tracks file *metadata*
  (name/category/date); wire up S3 or local disk storage behind the existing
  `/api/documents` POST route.
- Payroll is manual-entry; could be automated to auto-generate one entry per
  active employee per month via a cron/script that calls the same insert logic
  as `POST /api/payroll`.
