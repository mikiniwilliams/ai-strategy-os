import { useCaseCatalog } from "../data/useCaseCatalog";
import type { AIArtifactContent, AIArtifactKind, AIArtifactRecord, AIArtifactsState } from "./aiTypes";
import { validateAIArtifact } from "./aiSchemas";
import { defaultDiscovery, initialState } from "./defaults";
import {
  clearCurrentAIArtifacts,
  createAIArtifactVersion,
  getCurrentAIArtifact,
  listAIArtifactsByEngagementId,
  getDiscoveryByEngagementId,
  getEngagement,
  getExportSummaryByEngagementId,
  getLatestEngagement,
  getReadinessByEngagementId,
  listEngagements,
  listRoadmapItemsByEngagementId,
  listUseCasesByEngagementId,
  setCurrentAIArtifact,
  upsertDiscovery,
  upsertEngagement,
  upsertExportSummary,
  upsertReadiness,
  replaceRoadmapItems,
  replaceUseCases
} from "./repositories";
import type { Database } from "./supabase.types";
import type { AppState, DiscoveryForm, Engagement, ExportSummary, ReadinessAssessment, RoadmapItem, SavedEngagementSummary, UseCase } from "./types";

type EngagementRow = Database["public"]["Tables"]["engagements"]["Row"];
type DiscoveryRow = Database["public"]["Tables"]["discovery_responses"]["Row"];
type ReadinessRow = Database["public"]["Tables"]["readiness_assessments"]["Row"];
type UseCaseRow = Database["public"]["Tables"]["prioritized_use_cases"]["Row"];
type RoadmapRow = Database["public"]["Tables"]["roadmap_items"]["Row"];
type ExportRow = Database["public"]["Tables"]["export_summaries"]["Row"];
type AIArtifactRow = Database["public"]["Tables"]["ai_artifacts"]["Row"];

function buildCategory(overallScore: number) {
  return overallScore >= 75 ? "Execution ready" : overallScore >= 55 ? "Foundation building" : "Early-stage";
}

function buildRecommendations(overallScore: number) {
  if (overallScore >= 75) {
    return [
      "Launch one client-facing and one internal productivity pilot in parallel.",
      "Set a monthly steering cadence with success metrics tied to business value.",
      "Document reusable delivery patterns to prepare for scale."
    ];
  }

  if (overallScore >= 55) {
    return [
      "Start with narrow workflow use cases that prove value within 6 to 8 weeks.",
      "Stabilize data inputs and define a simple governance owner.",
      "Pair delivery teams with executive sponsors to accelerate adoption."
    ];
  }

  return [
    "Clarify a single business objective before expanding the pipeline of ideas.",
    "Invest in cleaner source data and repeatable delivery processes.",
    "Use low-risk copilots to build confidence and internal fluency."
  ];
}

function mapEngagementRow(row: EngagementRow): Engagement {
  return {
    id: row.id,
    projectName: row.project_name,
    clientName: row.client_name,
    sponsor: row.executive_sponsor ?? "",
    industry: row.industry ?? "",
    status: row.status,
    notes: row.notes ?? "",
    createdAt: row.created_at
  };
}

function mapDiscoveryRow(row: DiscoveryRow | null): DiscoveryForm {
  if (!row) {
    return defaultDiscovery;
  }

  return {
    businessGoal: row.primary_business_goal,
    transformationThesis: row.transformation_thesis ?? "",
    primaryChallenge: row.primary_challenge,
    currentAiMaturity: (row.current_ai_maturity as DiscoveryForm["currentAiMaturity"]) ?? defaultDiscovery.currentAiMaturity,
    dataEnvironment: (row.data_environment as DiscoveryForm["dataEnvironment"]) ?? defaultDiscovery.dataEnvironment,
    processDiscipline: (row.process_discipline as DiscoveryForm["processDiscipline"]) ?? defaultDiscovery.processDiscipline,
    teamReadiness: (row.team_readiness as DiscoveryForm["teamReadiness"]) ?? defaultDiscovery.teamReadiness,
    budgetHorizon: (row.budget_horizon as DiscoveryForm["budgetHorizon"]) ?? defaultDiscovery.budgetHorizon,
    successMetric: row.success_metric,
    constraints: row.constraints ?? ""
  };
}

function mapReadinessRow(row: ReadinessRow | null): ReadinessAssessment | null {
  if (!row) {
    return null;
  }

  return {
    overallScore: row.overall_score,
    category: buildCategory(row.overall_score),
    summary: row.summary,
    dimensions: [
      { label: "Leadership alignment", score: row.leadership_alignment, note: "Editable score persisted from Supabase." },
      { label: "Data readiness", score: row.data_readiness, note: "Editable score persisted from Supabase." },
      { label: "Process readiness", score: row.process_readiness, note: "Editable score persisted from Supabase." },
      { label: "Capability maturity", score: row.capability_maturity, note: "Editable score persisted from Supabase." },
      { label: "Investment capacity", score: row.investment_capacity, note: "Editable score persisted from Supabase." }
    ],
    recommendations: buildRecommendations(row.overall_score)
  };
}

function mapUseCaseRow(row: UseCaseRow): UseCase {
  const matchedTemplate = useCaseCatalog.find((item) => item.id === row.id || item.name === row.use_case_name);

  return {
    id: row.id,
    name: row.use_case_name,
    description: matchedTemplate?.description ?? "",
    impact: row.impact_score,
    feasibility: row.feasibility_score,
    score: row.overall_score,
    rationale: row.rationale
  };
}

function mapRoadmapRow(row: RoadmapRow): RoadmapItem {
  return {
    id: row.id,
    phase: row.phase_label,
    timeline: row.time_window,
    objective: row.objective,
    deliverables: row.actions
  };
}

function mapExportRow(row: ExportRow | null): ExportSummary | null {
  if (!row) {
    return null;
  }

  return {
    content: row.editable_summary_text ?? row.summary_text,
    updatedAt: row.updated_at
  };
}

function mapSummary(row: EngagementRow): SavedEngagementSummary {
  return {
    id: row.id,
    projectName: row.project_name,
    clientName: row.client_name,
    sponsor: row.executive_sponsor ?? "",
    industry: row.industry ?? "",
    status: row.status,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

function mapAIArtifacts(rows: AIArtifactRow[]): AIArtifactsState {
  return rows.reduce<AIArtifactsState>((accumulator, row) => {
    const key = row.artifact_type as AIArtifactKind;
    const current = accumulator[key];

    if (current && current.version >= row.version_number) {
      return accumulator;
    }

    accumulator[key] = {
      id: row.id,
      kind: row.artifact_type as AIArtifactKind,
      raw: row.raw_content as unknown as AIArtifactContent,
      editable: row.editable_content as unknown as AIArtifactContent,
      status: (row.status as AIArtifactRecord["status"]) ?? "draft",
      generatedAt: row.updated_at,
      version: row.version_number,
      regenerationGroupId: row.regeneration_group_id,
      parentArtifactId: row.parent_artifact_id,
      versionCount: rows.filter((candidate) => candidate.artifact_type === row.artifact_type).length
    };

    return accumulator;
  }, {});
}

export async function loadEngagementState(engagementId: string): Promise<AppState | null> {
  const engagement = await getEngagement(engagementId);

  if (!engagement) {
    return null;
  }

  const [discovery, readiness, useCases, roadmap, exportSummary, aiArtifacts] = await Promise.all([
    getDiscoveryByEngagementId(engagementId),
    getReadinessByEngagementId(engagementId),
    listUseCasesByEngagementId(engagementId),
    listRoadmapItemsByEngagementId(engagementId),
    getExportSummaryByEngagementId(engagementId),
    listAIArtifactsByEngagementId(engagementId)
  ]);

  return {
    engagement: mapEngagementRow(engagement),
    discovery: mapDiscoveryRow(discovery),
    readiness: mapReadinessRow(readiness),
    useCases: useCases.map(mapUseCaseRow),
    roadmap: roadmap.map(mapRoadmapRow),
    exportSummary: mapExportRow(exportSummary),
    aiArtifacts: mapAIArtifacts(aiArtifacts)
  };
}

export async function loadLatestEngagementState() {
  const latest = await getLatestEngagement();
  return latest ? loadEngagementState(latest.id) : null;
}

export async function listSavedEngagementSummaries() {
  const rows = await listEngagements();
  return rows.map(mapSummary);
}

export async function saveEngagement(engagement: Engagement) {
  return upsertEngagement({
    id: engagement.id,
    project_name: engagement.projectName,
    client_name: engagement.clientName,
    executive_sponsor: engagement.sponsor || null,
    industry: engagement.industry || null,
    status: engagement.status,
    notes: engagement.notes || null,
    created_at: engagement.createdAt
  });
}

export async function saveDiscovery(engagementId: string, discovery: DiscoveryForm) {
  return upsertDiscovery({
    engagement_id: engagementId,
    primary_business_goal: discovery.businessGoal,
    transformation_thesis: discovery.transformationThesis || null,
    primary_challenge: discovery.primaryChallenge,
    current_ai_maturity: discovery.currentAiMaturity,
    data_environment: discovery.dataEnvironment,
    process_discipline: discovery.processDiscipline,
    team_readiness: discovery.teamReadiness,
    budget_horizon: discovery.budgetHorizon,
    success_metric: discovery.successMetric,
    constraints: discovery.constraints || null
  });
}

export async function saveReadiness(engagementId: string, readiness: ReadinessAssessment) {
  return upsertReadiness({
    engagement_id: engagementId,
    overall_score: readiness.overallScore,
    recommendation_posture: buildCategory(readiness.overallScore),
    summary: readiness.summary,
    leadership_alignment: readiness.dimensions[0]?.score ?? 0,
    data_readiness: readiness.dimensions[1]?.score ?? 0,
    process_readiness: readiness.dimensions[2]?.score ?? 0,
    capability_maturity: readiness.dimensions[3]?.score ?? 0,
    investment_capacity: readiness.dimensions[4]?.score ?? 0,
    editable_override: true
  });
}

export async function saveUseCases(engagementId: string, useCases: UseCase[]) {
  return replaceUseCases(
    engagementId,
    useCases.map((useCase, index) => ({
      id: useCase.id,
      engagement_id: engagementId,
      use_case_name: useCase.name,
      impact_score: useCase.impact,
      feasibility_score: useCase.feasibility,
      overall_score: useCase.score,
      rationale: useCase.rationale,
      rank_order: index + 1,
      editable_override: true
    }))
  );
}

export async function saveRoadmap(engagementId: string, roadmap: RoadmapItem[]) {
  return replaceRoadmapItems(
    engagementId,
    roadmap.map((item, index) => ({
      id: item.id,
      engagement_id: engagementId,
      phase_number: index + 1,
      phase_label: item.phase,
      time_window: item.timeline,
      objective: item.objective,
      actions: item.deliverables,
      notes: null,
      editable_override: true
    }))
  );
}

export async function saveExportSummary(engagementId: string, exportSummary: ExportSummary) {
  return upsertExportSummary({
    engagement_id: engagementId,
    summary_text: exportSummary.content,
    editable_summary_text: exportSummary.content,
    export_format: "text",
    generated_by: "rules"
  });
}

export async function saveAIArtifact(engagementId: string, artifact: AIArtifactRecord) {
  const current = await getCurrentAIArtifact(engagementId, artifact.kind);
  const parsedRaw = validateAIArtifact(artifact.kind, artifact.raw);
  const parsedEditable = validateAIArtifact(artifact.kind, artifact.editable);
  const nextVersion = current ? current.version_number + 1 : 1;
  const regenerationGroupId = artifact.regenerationGroupId ?? current?.regeneration_group_id ?? crypto.randomUUID();

  await clearCurrentAIArtifacts(engagementId, artifact.kind);

  const created = await createAIArtifactVersion({
    engagement_id: engagementId,
    artifact_type: artifact.kind,
    version_number: nextVersion,
    is_current: true,
    regeneration_group_id: regenerationGroupId,
    parent_artifact_id: current?.id ?? artifact.parentArtifactId ?? null,
    raw_content: parsedRaw as unknown as Database["public"]["Tables"]["ai_artifacts"]["Insert"]["raw_content"],
    editable_content: parsedEditable as unknown as Database["public"]["Tables"]["ai_artifacts"]["Insert"]["editable_content"],
    status: artifact.status,
    generated_by: "openai"
  });

  await setCurrentAIArtifact(created.id);
  return created;
}

export function mergeStateWithDefaults(state: AppState | null) {
  return state ? { ...initialState, ...state } : initialState;
}
