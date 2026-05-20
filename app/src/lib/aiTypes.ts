export const aiArtifactKinds = [
  "discovery_summary",
  "readiness_narrative",
  "use_case_assistant",
  "roadmap_draft",
  "export_executive_summary"
] as const;

export type AIArtifactKind = (typeof aiArtifactKinds)[number];

export interface DiscoverySummaryArtifact {
  summary: string;
  likelyOpportunities: string[];
  keyRisks: string[];
}

export interface ReadinessNarrativeArtifact {
  explanation: string;
  blockers: string[];
  nextActions: string[];
}

export interface UseCaseAssistantGroup {
  title: string;
  items: string[];
}

export interface UseCaseAssistantArtifact {
  overview: string;
  quickWins: UseCaseAssistantGroup;
  strategicBets: UseCaseAssistantGroup;
  watchouts: UseCaseAssistantGroup;
}

export interface RoadmapDraftArtifact {
  narrative: string;
  days30: string[];
  days60: string[];
  days90: string[];
}

export interface ExportExecutiveSummaryArtifact {
  executiveSummary: string;
  recommendation: string;
  nextSteps: string[];
}

export type AIArtifactContent =
  | DiscoverySummaryArtifact
  | ReadinessNarrativeArtifact
  | UseCaseAssistantArtifact
  | RoadmapDraftArtifact
  | ExportExecutiveSummaryArtifact;

export interface AIArtifactRecord<T extends AIArtifactContent = AIArtifactContent> {
  id?: string;
  kind: AIArtifactKind;
  raw: T;
  editable: T;
  status: "draft" | "accepted" | "edited";
  generatedAt: string;
  version: number;
  regenerationGroupId?: string;
  parentArtifactId?: string | null;
  versionCount?: number;
}

export type AIArtifactsState = Partial<Record<AIArtifactKind, AIArtifactRecord>>;
