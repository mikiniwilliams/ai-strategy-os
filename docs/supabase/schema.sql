create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create table if not exists public.engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  project_name text not null,
  client_name text not null,
  executive_sponsor text null,
  industry text null,
  status text not null default 'draft',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discovery_responses (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  primary_business_goal text not null,
  transformation_thesis text null,
  primary_challenge text not null,
  current_ai_maturity text null,
  data_environment text null,
  process_discipline text null,
  team_readiness text null,
  budget_horizon text null,
  success_metric text not null,
  constraints text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.readiness_assessments (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  overall_score integer not null,
  recommendation_posture text not null,
  summary text not null,
  leadership_alignment integer not null,
  data_readiness integer not null,
  process_readiness integer not null,
  capability_maturity integer not null,
  investment_capacity integer not null,
  editable_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint readiness_assessments_overall_score_check check (overall_score between 0 and 100),
  constraint readiness_assessments_leadership_alignment_check check (leadership_alignment between 0 and 100),
  constraint readiness_assessments_data_readiness_check check (data_readiness between 0 and 100),
  constraint readiness_assessments_process_readiness_check check (process_readiness between 0 and 100),
  constraint readiness_assessments_capability_maturity_check check (capability_maturity between 0 and 100),
  constraint readiness_assessments_investment_capacity_check check (investment_capacity between 0 and 100)
);

create table if not exists public.prioritized_use_cases (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  use_case_name text not null,
  impact_score integer not null,
  feasibility_score integer not null,
  overall_score integer not null,
  rationale text not null,
  rank_order integer not null,
  editable_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prioritized_use_cases_impact_score_check check (impact_score between 0 and 100),
  constraint prioritized_use_cases_feasibility_score_check check (feasibility_score between 0 and 100),
  constraint prioritized_use_cases_overall_score_check check (overall_score between 0 and 100),
  constraint prioritized_use_cases_rank_order_check check (rank_order > 0)
);

create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  phase_number integer not null,
  phase_label text not null,
  time_window text not null,
  objective text not null,
  actions text not null,
  notes text null,
  editable_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roadmap_items_phase_number_check check (phase_number > 0)
);

create table if not exists public.export_summaries (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  summary_text text not null,
  editable_summary_text text null,
  export_format text not null default 'text',
  generated_by text not null default 'rules',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_artifacts (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  artifact_type text not null,
  version_number integer not null default 1,
  is_current boolean not null default true,
  regeneration_group_id uuid not null default gen_random_uuid(),
  parent_artifact_id uuid null references public.ai_artifacts(id) on delete set null,
  raw_content jsonb not null,
  editable_content jsonb not null,
  status text not null default 'draft',
  generated_by text not null default 'openai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_artifacts_version_check check (version_number > 0),
  constraint ai_artifacts_status_check check (status in ('draft', 'accepted', 'edited'))
);

create index if not exists engagements_status_idx on public.engagements(status);
create index if not exists engagements_client_name_idx on public.engagements(client_name);
create index if not exists engagements_user_id_idx on public.engagements(user_id);
create index if not exists discovery_responses_engagement_id_idx on public.discovery_responses(engagement_id);
create index if not exists readiness_assessments_engagement_id_idx on public.readiness_assessments(engagement_id);
create index if not exists prioritized_use_cases_engagement_id_idx on public.prioritized_use_cases(engagement_id);
create index if not exists prioritized_use_cases_rank_order_idx on public.prioritized_use_cases(engagement_id, rank_order);
create index if not exists roadmap_items_engagement_id_idx on public.roadmap_items(engagement_id);
create index if not exists roadmap_items_phase_number_idx on public.roadmap_items(engagement_id, phase_number);
create index if not exists export_summaries_engagement_id_idx on public.export_summaries(engagement_id);
create index if not exists ai_artifacts_engagement_id_idx on public.ai_artifacts(engagement_id);
create index if not exists ai_artifacts_type_idx on public.ai_artifacts(engagement_id, artifact_type);
create unique index if not exists ai_artifacts_current_unique_idx
on public.ai_artifacts(engagement_id, artifact_type)
where is_current = true;
create unique index if not exists ai_artifacts_version_unique_idx
on public.ai_artifacts(engagement_id, artifact_type, version_number);

drop trigger if exists engagements_set_updated_at on public.engagements;
create trigger engagements_set_updated_at
before update on public.engagements
for each row
execute function public.set_updated_at();

drop trigger if exists discovery_responses_set_updated_at on public.discovery_responses;
create trigger discovery_responses_set_updated_at
before update on public.discovery_responses
for each row
execute function public.set_updated_at();

drop trigger if exists readiness_assessments_set_updated_at on public.readiness_assessments;
create trigger readiness_assessments_set_updated_at
before update on public.readiness_assessments
for each row
execute function public.set_updated_at();

drop trigger if exists prioritized_use_cases_set_updated_at on public.prioritized_use_cases;
create trigger prioritized_use_cases_set_updated_at
before update on public.prioritized_use_cases
for each row
execute function public.set_updated_at();

drop trigger if exists roadmap_items_set_updated_at on public.roadmap_items;
create trigger roadmap_items_set_updated_at
before update on public.roadmap_items
for each row
execute function public.set_updated_at();

drop trigger if exists export_summaries_set_updated_at on public.export_summaries;
create trigger export_summaries_set_updated_at
before update on public.export_summaries
for each row
execute function public.set_updated_at();

drop trigger if exists ai_artifacts_set_updated_at on public.ai_artifacts;
create trigger ai_artifacts_set_updated_at
before update on public.ai_artifacts
for each row
execute function public.set_updated_at();

alter table public.engagements enable row level security;
alter table public.discovery_responses enable row level security;
alter table public.readiness_assessments enable row level security;
alter table public.prioritized_use_cases enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.export_summaries enable row level security;
alter table public.ai_artifacts enable row level security;

drop policy if exists "engagements_select_own" on public.engagements;
create policy "engagements_select_own"
on public.engagements
for select
to authenticated
using (user_id is not null and auth.uid() = user_id);

drop policy if exists "engagements_insert_own" on public.engagements;
create policy "engagements_insert_own"
on public.engagements
for insert
to authenticated
with check (user_id is not null and auth.uid() = user_id);

drop policy if exists "engagements_update_own" on public.engagements;
create policy "engagements_update_own"
on public.engagements
for update
to authenticated
using (user_id is not null and auth.uid() = user_id)
with check (user_id is not null and auth.uid() = user_id);

drop policy if exists "engagements_delete_own" on public.engagements;
create policy "engagements_delete_own"
on public.engagements
for delete
to authenticated
using (user_id is not null and auth.uid() = user_id);

drop policy if exists "discovery_responses_select_own" on public.discovery_responses;
create policy "discovery_responses_select_own"
on public.discovery_responses
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = discovery_responses.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "discovery_responses_insert_own" on public.discovery_responses;
create policy "discovery_responses_insert_own"
on public.discovery_responses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = discovery_responses.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "discovery_responses_update_own" on public.discovery_responses;
create policy "discovery_responses_update_own"
on public.discovery_responses
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = discovery_responses.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = discovery_responses.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "discovery_responses_delete_own" on public.discovery_responses;
create policy "discovery_responses_delete_own"
on public.discovery_responses
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = discovery_responses.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "readiness_assessments_select_own" on public.readiness_assessments;
create policy "readiness_assessments_select_own"
on public.readiness_assessments
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = readiness_assessments.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "readiness_assessments_insert_own" on public.readiness_assessments;
create policy "readiness_assessments_insert_own"
on public.readiness_assessments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = readiness_assessments.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "readiness_assessments_update_own" on public.readiness_assessments;
create policy "readiness_assessments_update_own"
on public.readiness_assessments
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = readiness_assessments.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = readiness_assessments.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "readiness_assessments_delete_own" on public.readiness_assessments;
create policy "readiness_assessments_delete_own"
on public.readiness_assessments
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = readiness_assessments.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "prioritized_use_cases_select_own" on public.prioritized_use_cases;
create policy "prioritized_use_cases_select_own"
on public.prioritized_use_cases
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = prioritized_use_cases.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "prioritized_use_cases_insert_own" on public.prioritized_use_cases;
create policy "prioritized_use_cases_insert_own"
on public.prioritized_use_cases
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = prioritized_use_cases.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "prioritized_use_cases_update_own" on public.prioritized_use_cases;
create policy "prioritized_use_cases_update_own"
on public.prioritized_use_cases
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = prioritized_use_cases.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = prioritized_use_cases.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "prioritized_use_cases_delete_own" on public.prioritized_use_cases;
create policy "prioritized_use_cases_delete_own"
on public.prioritized_use_cases
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = prioritized_use_cases.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "roadmap_items_select_own" on public.roadmap_items;
create policy "roadmap_items_select_own"
on public.roadmap_items
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = roadmap_items.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "roadmap_items_insert_own" on public.roadmap_items;
create policy "roadmap_items_insert_own"
on public.roadmap_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = roadmap_items.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "roadmap_items_update_own" on public.roadmap_items;
create policy "roadmap_items_update_own"
on public.roadmap_items
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = roadmap_items.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = roadmap_items.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "roadmap_items_delete_own" on public.roadmap_items;
create policy "roadmap_items_delete_own"
on public.roadmap_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = roadmap_items.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "export_summaries_select_own" on public.export_summaries;
create policy "export_summaries_select_own"
on public.export_summaries
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = export_summaries.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "export_summaries_insert_own" on public.export_summaries;
create policy "export_summaries_insert_own"
on public.export_summaries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = export_summaries.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "export_summaries_update_own" on public.export_summaries;
create policy "export_summaries_update_own"
on public.export_summaries
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = export_summaries.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = export_summaries.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "export_summaries_delete_own" on public.export_summaries;
create policy "export_summaries_delete_own"
on public.export_summaries
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = export_summaries.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "ai_artifacts_select_own" on public.ai_artifacts;
create policy "ai_artifacts_select_own"
on public.ai_artifacts
for select
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = ai_artifacts.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "ai_artifacts_insert_own" on public.ai_artifacts;
create policy "ai_artifacts_insert_own"
on public.ai_artifacts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = ai_artifacts.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "ai_artifacts_update_own" on public.ai_artifacts;
create policy "ai_artifacts_update_own"
on public.ai_artifacts
for update
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = ai_artifacts.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.engagements e
    where e.id = ai_artifacts.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

drop policy if exists "ai_artifacts_delete_own" on public.ai_artifacts;
create policy "ai_artifacts_delete_own"
on public.ai_artifacts
for delete
to authenticated
using (
  exists (
    select 1
    from public.engagements e
    where e.id = ai_artifacts.engagement_id
      and e.user_id is not null
      and e.user_id = auth.uid()
  )
);

grant select, insert, update, delete on public.engagements to authenticated;
grant select, insert, update, delete on public.discovery_responses to authenticated;
grant select, insert, update, delete on public.readiness_assessments to authenticated;
grant select, insert, update, delete on public.prioritized_use_cases to authenticated;
grant select, insert, update, delete on public.roadmap_items to authenticated;
grant select, insert, update, delete on public.export_summaries to authenticated;
grant select, insert, update, delete on public.ai_artifacts to authenticated;
