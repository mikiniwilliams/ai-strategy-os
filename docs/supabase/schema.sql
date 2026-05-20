create table if not exists public.engagements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
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

drop policy if exists "users can read their own engagements" on public.engagements;
create policy "users can read their own engagements"
on public.engagements
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "users can insert their own engagements" on public.engagements;
create policy "users can insert their own engagements"
on public.engagements
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "users can update their own engagements" on public.engagements;
create policy "users can update their own engagements"
on public.engagements
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

grant select, insert, update on public.engagements to authenticated;
