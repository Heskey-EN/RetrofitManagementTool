# Retrofit Job Management Tool

A job management system for **Eco Futures**. Add jobs by hand or upload a CSV,
see them as cards in a list, view their timelines on a calendar, track each job
through the retrofit workflow, and attach documents — all stored locally in the
browser with no backend required.

## What it does

- **Add jobs** — a manual form (name, address, postcode, status, dates) or a CSV
  upload (drag-and-drop, parsed in-browser with Papa Parse).
- **Job list** — one card per job, searchable and filterable by status.
- **Calendar timeline** — a lightweight Gantt-style view of dated jobs.
- **Retrofit workflow statuses** — Booking · Assessment · Coordination ·
  Compiling documents · Submitted.
- **Documents per job** — upload files (PDFs etc.) and attach links. Each
  document is filed into a folder per status, with a **Master** folder that shows
  everything for the job.
- **Local-first storage** — jobs and documents (including uploaded files) live in
  the browser via **IndexedDB**, synced across tabs on the same machine. No
  accounts, no server, no monthly cost.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. Click **+ Add job** to create one by hand, or drag in
`sample-data/jobs-sample.csv`. Everything persists locally between sessions.

## Storage & the backend layer

Data lives in IndexedDB on each user's machine, so there's currently **no live
sync between different people**. The backend is deliberately pluggable
([`src/lib/jobsStore.js`](src/lib/jobsStore.js)): swapping the local
implementation for a hosted one (Firebase, PocketBase, or Supabase) adds
real-time multi-user sync without touching the UI. The Supabase path below is
kept wired for whenever that's wanted.

## Optional: real-time multi-user sync (Supabase)

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

   Note: this syncs **jobs**. Uploaded documents currently stay in local
   IndexedDB; moving file storage to a hosted bucket (e.g. Supabase Storage) is a
   follow-up.

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
    idb.js              IndexedDB wrapper (jobs + documents stores)
    jobsStore.js        Pluggable backend: local (IndexedDB) or Supabase
    documentsStore.js   Per-job files + links, filed into status folders
    csv.js              Papa Parse wrapper + column/date detection
    status.js           Retrofit workflow statuses and colours
    supabaseClient.js   Supabase client (only used if env vars are set)
  hooks/
    useJobs.js          Loads, subscribes, and mutates jobs
    useDocuments.js     Loads and mutates one job's documents
  components/           Upload, add-job modal, list, cards, timeline,
                        detail drawer, documents panel
  App.jsx               Layout, tabs, stats
supabase/schema.sql     Optional: run in a Supabase project for multi-user sync
sample-data/            Example CSV
```

## Roadmap (next)

- **Multi-user sync** — connect a hosted backend (Firebase / PocketBase /
  Supabase) so 40–50 users share data live, plus hosted file storage.
- Retrofit-specific fields: measures, install dates, compliance details.
- Auth with per-user / per-organisation access.
- Branding and refined UI.

## Tech

- Vite + React, deployable to Vercel (~£20/mo). Currently no backend cost —
  storage is local (IndexedDB). A hosted backend would be added when live
  multi-user sync is needed.
