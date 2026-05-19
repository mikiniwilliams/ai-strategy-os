export interface Engagement {
  id: string;
  projectName: string;
  clientName: string;
  sponsor: string;
  industry: string;
  status: string;
  notes: string;
  createdAt: string;
}

export interface DiscoveryForm {
  businessGoal: string;
  transformationThesis: string;
  primaryChallenge: string;
  currentAiMaturity: "nascent" | "piloting" | "scaling";
  dataEnvironment: "fragmented" | "developing" | "strong";
  processDiscipline: "manual" | "mixed" | "structured";
  teamReadiness: "hesitant" | "curious" | "committed";
  budgetHorizon: "limited" | "moderate" | "funded";
  successMetric: string;
  constraints: string;
}

export interface ReadinessDimension {
  label: string;
  score: number;
  note: string;
}

export interface ReadinessAssessment {
  overallScore: number;
  category: string;
  summary: string;
  dimensions: ReadinessDimension[];
  recommendations: string[];
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  impact: number;
  feasibility: number;
  score: number;
  rationale: string;
}

export interface RoadmapItem {
  id: string;
  phase: string;
  timeline: string;
  objective: string;
  deliverables: string;
}

export interface ExportSummary {
  content: string;
  updatedAt: string;
}

export interface AppState {
  engagement: Engagement | null;
  discovery: DiscoveryForm;
  readiness: ReadinessAssessment | null;
  useCases: UseCase[];
  roadmap: RoadmapItem[];
  exportSummary: ExportSummary | null;
}

export interface SavedEngagementSummary {
  id: string;
  projectName: string;
  clientName: string;
  sponsor: string;
  industry: string;
  status: string;
  updatedAt: string;
  createdAt: string;
}
