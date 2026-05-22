-- Initial schema for screenplay-agent.
-- Each row is owned by the authenticated user (auth.uid()).
-- All access is gated by Row Level Security.
-- Data shapes (Series, Arc, Episode) are stored as JSONB blobs;
-- only structural fields (ids, foreign keys, episode_number) sit in columns.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  series_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.series (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arcs (
  series_id text primary key references public.series(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.episodes (
  id text primary key,
  series_id text not null references public.series(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  episode_number int not null,
  data jsonb not null,
  generated_at timestamptz not null default now(),
  unique (series_id, episode_number)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists projects_user_idx
  on public.projects(user_id, updated_at desc);

create index if not exists series_user_idx
  on public.series(user_id, updated_at desc);

create index if not exists episodes_series_idx
  on public.episodes(series_id, episode_number);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.series   enable row level security;
alter table public.arcs     enable row level security;
alter table public.episodes enable row level security;

drop policy if exists "projects: users own their rows" on public.projects;
drop policy if exists "series: users own their rows"   on public.series;
drop policy if exists "arcs: users own their rows"     on public.arcs;
drop policy if exists "episodes: users own their rows" on public.episodes;

create policy "projects: users own their rows"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "series: users own their rows"
  on public.series for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "arcs: users own their rows"
  on public.arcs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "episodes: users own their rows"
  on public.episodes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
