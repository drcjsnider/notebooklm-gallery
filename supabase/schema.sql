create extension if not exists "pgcrypto";

create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  notebook_name text not null,
  description text not null,
  link text not null unique,
  tags text[] not null default '{}',
  submitter_email text not null,
  og_image_url text,
  og_title text,
  og_description text,
  status text not null default 'approved' check (status in ('approved', 'removed', 'rejected')),
  legal_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists notebooks_status_created_at_idx
  on public.notebooks (status, created_at desc);

create index if not exists reports_notebook_id_idx
  on public.reports (notebook_id, created_at desc);
