-- Optional demo seed for one authenticated test user.
-- Replace the placeholder UUID below with a real auth.users.id from your Supabase project.

with demo_engagement as (
  insert into public.engagements (
    user_id,
    project_name,
    client_name,
    executive_sponsor,
    industry,
    status,
    notes
  )
  values (
    '11111111-1111-1111-1111-111111111111',
    'SMB AI Implementation Project',
    'SMB Solutions',
    'Gary Vincent',
    'Financial',
    'in_discovery',
    'Demo seed row for quick workflow testing.'
  )
  returning id
)
insert into public.discovery_responses (
  engagement_id,
  primary_business_goal,
  transformation_thesis,
  primary_challenge,
  current_ai_maturity,
  data_environment,
  process_discipline,
  team_readiness,
  budget_horizon,
  success_metric,
  constraints
)
select
  id,
  'Reduce manual delivery time by 20%',
  'Use AI copilots to speed up knowledge work and proposal generation.',
  'Consultants lose time synthesizing research and drafting repeatable deliverables.',
  'piloting',
  'developing',
  'mixed',
  'curious',
  'moderate',
  'Reduce turnaround time on strategy deliverables',
  'Limited internal data engineering capacity'
from demo_engagement;

with target_engagement as (
  select id
  from public.engagements
  where project_name = 'SMB AI Implementation Project'
  order by created_at desc
  limit 1
)
insert into public.readiness_assessments (
  engagement_id,
  overall_score,
  recommendation_posture,
  summary,
  leadership_alignment,
  data_readiness,
  process_readiness,
  capability_maturity,
  investment_capacity,
  editable_override
)
select
  id,
  64,
  'foundation_building',
  'The client is ready for focused pilots with moderate process and data improvements.',
  65,
  60,
  62,
  63,
  70,
  false
from target_engagement;

with target_engagement as (
  select id
  from public.engagements
  where project_name = 'SMB AI Implementation Project'
  order by created_at desc
  limit 1
)
insert into public.prioritized_use_cases (
  engagement_id,
  use_case_name,
  impact_score,
  feasibility_score,
  overall_score,
  rationale,
  rank_order
)
select id, 'Proposal Copilot', 82, 71, 78, 'Strong value with manageable change effort.', 1 from target_engagement
union all
select id, 'Research Synthesis Engine', 79, 69, 75, 'Fits the core delivery bottleneck well.', 2 from target_engagement
union all
select id, 'Meeting Intelligence', 72, 74, 73, 'Easy operational win for the consulting team.', 3 from target_engagement;

with target_engagement as (
  select id
  from public.engagements
  where project_name = 'SMB AI Implementation Project'
  order by created_at desc
  limit 1
)
insert into public.roadmap_items (
  engagement_id,
  phase_number,
  phase_label,
  time_window,
  objective,
  actions,
  notes
)
select id, 1, 'Phase 1', '0-30 days', 'Align scope and select pilot', 'Confirm metrics, owners, and source inputs.', 'Start with one internal use case.' from target_engagement
union all
select id, 2, 'Phase 2', '30-60 days', 'Run pilot and collect evidence', 'Launch workflow, review outputs, gather feedback.', 'Keep change management light but visible.' from target_engagement
union all
select id, 3, 'Phase 3', '60-90 days', 'Expand into repeatable roadmap', 'Document lessons learned and prioritize scale candidates.', 'Use pilot results in the client summary.' from target_engagement;

with target_engagement as (
  select id
  from public.engagements
  where project_name = 'SMB AI Implementation Project'
  order by created_at desc
  limit 1
)
insert into public.export_summaries (
  engagement_id,
  summary_text,
  editable_summary_text,
  export_format,
  generated_by
)
select
  id,
  'AI Strategy OS generated a draft summary for SMB Solutions.',
  'SMB Solutions is positioned for a focused AI pilot program centered on proposal acceleration and research synthesis.',
  'text',
  'rules'
from target_engagement;
