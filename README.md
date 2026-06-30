# Retrofit Job Management Tool

A real-time job management system for **Eco Futures**. Upload a CSV of jobs, see
them as cards in a list, view their timelines on a calendar, and update status
live across 40–50 concurrent users.

This is the **Phase 1 MVP**: deliberately generic (no retrofit-specific fields
or branding yet). It reads whatever columns your CSV contains.

## What it does

- **CSV upload** — drag-and-drop or browse; parsed in the browser with Papa Parse.
- **Job list** — one card per row, searchable and filterable by status.
- **Calendar timeline** — a lightweight Gantt-style view of dated jobs.
- **Real-time sync** — status and date changes propagate live to every user.
- **Status tracking** — Not Started · Scheduled · In Progress · On Hold · Complete.

## Quick start (local)

```bash
npm install
npm run dev
```

Open http://localhost:5173. With no Supabase keys set, the app runs in **local
mode**: jobs are stored in your browser and synced across tabs on this machine.
Drag in `sample-data/jobs-sample.csv` to try it.

## Enabling real-time multi-user sync (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `jobs` table and turns on real-time streaming.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public**
   key.
4. Copy `.env.example` to `.env` and fill them in:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Restart `npm run dev`. The header badge switches from **Local mode** to
   **Live sync**. Open two browsers / machines and watch updates propagate.

## Deploying to Vercel

1. Push this repo to GitHub (already configured for
   `Heskey-EN/RetrofitManagementTool`).
2. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel
   auto-detects Vite.
3. Add the two `VITE_SUPABASE_*` environment variables in the Vercel project
   settings.
4. Deploy. The included `vercel.json` handles the SPA build and routing.

## How CSV columns are mapped

The UI is intentionally generic, so only a few things are auto-detected:

- **Title** — first column whose name looks like a job/name/reference/address.
- **Start date** — first date-like column (start/install/scheduled/date…).
- **End date** — a separate end/finish/completion/due column if present.

Every original column is preserved and shown in full on the job detail panel.
UK-style `DD/MM/YYYY` dates are understood, along with ISO and common formats.

## Project structure

```
src/
  lib/
    supabaseClient.js   Supabase client (or null in local mode)
    jobsStore.js        Backend abstraction: Supabase or local fallback + realtime
    csv.js              Papa Parse wrapper + column/date detection
    status.js           Status values and colours
  hooks/useJobs.js      Loads, subscribes, and mutates jobs
  components/           Upload, list, cards, timeline, detail drawer
  App.jsx               Layout, tabs, stats
supabase/schema.sql     Run this in your Supabase project
sample-data/            Example CSV
```

## Roadmap (Phase 2)

- Retrofit-specific fields: measures, install dates, compliance details.
- Supabase Auth with per-user / per-organisation row-level security.
- Branding and refined UI.

## Tech & budget

- Frontend: Vite + React on Vercel (~£20/mo).
- Backend: Supabase realtime Postgres (~£80–150/mo at 40–50 users).
