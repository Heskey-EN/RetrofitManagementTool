-- Retrofit Job Management — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create extension if not exists "uuid-ossp";

create table if not exists public.jobs (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null default 'Untitled job',
  status      text not null default 'Not Started',
  start_date  date,
  end_date    date,
  data        jsonb not null default '{}'::jsonb,
  batch_id    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- Row Level Security.
-- MVP: the app uses the public anon key with no login, so we allow full access.
-- Phase 2: add Supabase Auth and replace this with per-user / per-org policies.
alter table public.jobs enable row level security;

drop policy if exists "public access" on public.jobs;
create policy "public access" on public.jobs
  for all using (true) with check (true);

-- Enable real-time change streaming for this table.
alter table public.jobs replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'jobs'
  ) then
    alter publication supabase_realtime add table public.jobs;
  end if;
end $$;
