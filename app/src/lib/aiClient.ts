import type {
  AIArtifactContent,
  AIArtifactKind,
  DiscoverySummaryArtifact,
  ExportExecutiveSummaryArtifact,
  ReadinessNarrativeArtifact,
  RoadmapDraftArtifact,
  UseCaseAssistantArtifact
} from "./aiTypes";
import type { AppState } from "./types";

const AI_SESSION_KEY = "ai-strategy-os-ai-session";

function getAISessionId() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem(AI_SESSION_KEY);

  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(AI_SESSION_KEY, created);
  return created;
}

interface AssistResponseMap {
  discovery_summary: DiscoverySummaryArtifact;
  readiness_narrative: ReadinessNarrativeArtifact;
  use_case_assistant: UseCaseAssistantArtifact;
  roadmap_draft: RoadmapDraftArtifact;
  export_executive_summary: ExportExecutiveSummaryArtifact;
}

export async function generateAIArtifact<K extends AIArtifactKind>(
  kind: K,
  state: AppState
): Promise<AssistResponseMap[K]> {
  const sessionId = getAISessionId();
  const response = await fetch("/api/ai-assist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ai-session": sessionId
    },
    body: JSON.stringify({
      kind,
      engagementId: state.engagement?.id ?? null,
      state
    })
  });

  if (!response.ok) {
    let errorMessage = "AI assist request failed.";

    try {
      const data = (await response.json()) as { error?: string };
      errorMessage = data.error ?? errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const data = (await response.json()) as { artifact: AIArtifactContent };
  return data.artifact as AssistResponseMap[K];
}
