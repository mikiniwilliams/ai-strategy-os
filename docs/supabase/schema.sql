create table if not exists public.engagements (
  id uuid primary key,
  project_name text not null,
  client_name text not null,
  sponsor text not null,
  industry text not null default '',
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  snapshot jsonb not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists engagements_set_updated_at on public.engagements;

create trigger engagements_set_updated_at
before update on public.engagements
for each row
execute function public.set_updated_at();

alter table public.engagements enable row level security;

drop policy if exists "mvp anon can read engagements" on public.engagements;
create policy "mvp anon can read engagements"
on public.engagements
for select
to anon
using (true);

drop policy if exists "mvp anon can insert engagements" on public.engagements;
create policy "mvp anon can insert engagements"
on public.engagements
for insert
to anon
with check (true);

drop policy if exists "mvp anon can update engagements" on public.engagements;
create policy "mvp anon can update engagements"
on public.engagements
for update
to anon
using (true)
with check (true);

grant select, insert, update on public.engagements to anon;
