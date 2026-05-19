import type { AppState, DiscoveryForm } from "./types";

export const defaultDiscovery: DiscoveryForm = {
  businessGoal: "",
  transformationThesis: "",
  primaryChallenge: "",
  currentAiMaturity: "nascent",
  dataEnvironment: "fragmented",
  processDiscipline: "manual",
  teamReadiness: "hesitant",
  budgetHorizon: "limited",
  successMetric: "",
  constraints: ""
};

export const initialState: AppState = {
  engagement: null,
  discovery: defaultDiscovery,
  readiness: null,
  useCases: [],
  roadmap: [],
  exportSummary: null
};
