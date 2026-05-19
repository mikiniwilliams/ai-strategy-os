import { useCaseCatalog } from "../data/useCaseCatalog";
import type {
  DiscoveryForm,
  Engagement,
  ExportSummary,
  ReadinessAssessment,
  ReadinessDimension,
  RoadmapItem,
  UseCase
} from "./types";

const scoreMap = {
  nascent: 35,
  piloting: 65,
  scaling: 85,
  fragmented: 40,
  developing: 65,
  strong: 85,
  manual: 40,
  mixed: 65,
  structured: 85,
  hesitant: 35,
  curious: 65,
  committed: 85,
  limited: 45,
  moderate: 65,
  funded: 85
} as const;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildReadinessAssessment(discovery: DiscoveryForm): ReadinessAssessment {
  const dimensions: ReadinessDimension[] = [
    {
      label: "Leadership alignment",
      score: scoreMap[discovery.teamReadiness],
      note: `Team posture is ${discovery.teamReadiness}.`
    },
    {
      label: "Data readiness",
      score: scoreMap[discovery.dataEnvironment],
      note: `Data environment is ${discovery.dataEnvironment}.`
    },
    {
      label: "Process readiness",
      score: scoreMap[discovery.processDiscipline],
      note: `Process discipline is ${discovery.processDiscipline}.`
    },
    {
      label: "Capability maturity",
      score: scoreMap[discovery.currentAiMaturity],
      note: `Current AI maturity is ${discovery.currentAiMaturity}.`
    },
    {
      label: "Investment capacity",
      score: scoreMap[discovery.budgetHorizon],
      note: `Budget horizon is ${discovery.budgetHorizon}.`
    }
  ];

  const overallScore = clampScore(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length
  );

  const category =
    overallScore >= 75 ? "Execution ready" : overallScore >= 55 ? "Foundation building" : "Early-stage";

  const summary =
    overallScore >= 75
      ? "The client has enough sponsorship and operating discipline to move from discovery into targeted pilots quickly."
      : overallScore >= 55
        ? "The client is viable for near-term pilots, but needs a sharper operating model and better data footing before scaling."
        : "The client should focus on readiness basics before pursuing complex AI initiatives.";

  const recommendations =
    overallScore >= 75
      ? [
          "Launch one client-facing and one internal productivity pilot in parallel.",
          "Set a monthly steering cadence with success metrics tied to business value.",
          "Document reusable delivery patterns to prepare for scale."
        ]
      : overallScore >= 55
        ? [
            "Start with narrow workflow use cases that prove value within 6 to 8 weeks.",
            "Stabilize data inputs and define a simple governance owner.",
            "Pair delivery teams with executive sponsors to accelerate adoption."
          ]
        : [
            "Clarify a single business objective before expanding the pipeline of ideas.",
            "Invest in cleaner source data and repeatable delivery processes.",
            "Use low-risk copilots to build confidence and internal fluency."
          ];

  return {
    overallScore,
    category,
    summary,
    dimensions,
    recommendations
  };
}

function matchBonus(discovery: DiscoveryForm, label: string) {
  const signalText = `${discovery.businessGoal} ${discovery.primaryChallenge} ${discovery.constraints}`.toLowerCase();

  if (label.includes("Knowledge") && /knowledge|search|research|insight/.test(signalText)) {
    return 8;
  }

  if (label.includes("Workflow") && /manual|workflow|process|operations/.test(signalText)) {
    return 8;
  }

  if (label.includes("Client") && /client|portal|service|support/.test(signalText)) {
    return 8;
  }

  return 0;
}

export function buildPrioritizedUseCases(
  discovery: DiscoveryForm,
  readiness: ReadinessAssessment
): UseCase[] {
  return useCaseCatalog
    .map((template, index) => {
      const impactBase = 62 + index * 3;
      const feasibilityBase = readiness.overallScore - index * 2;
      const impact = clampScore(impactBase + matchBonus(discovery, template.name));
      const feasibility = clampScore(feasibilityBase + (discovery.currentAiMaturity === "scaling" ? 6 : 0));
      const score = clampScore(impact * 0.6 + feasibility * 0.4);

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        impact,
        feasibility,
        score,
        rationale: `${template.name} fits the stated goal of ${discovery.businessGoal.toLowerCase() || "driving measurable value"} while staying aligned to current readiness.`
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildRoadmap(useCases: UseCase[], engagement: Engagement | null): RoadmapItem[] {
  const topThree = useCases.slice(0, 3);

  return [
    {
      id: "phase-1",
      phase: "Phase 1",
      timeline: "0-30 days",
      objective: `Align scope and launch ${topThree[0]?.name ?? "the first pilot"} for ${engagement?.clientName ?? "the client"}.`,
      deliverables: "Success metrics, delivery owner, pilot brief, baseline process map."
    },
    {
      id: "phase-2",
      phase: "Phase 2",
      timeline: "30-60 days",
      objective: `Operationalize ${topThree[1]?.name ?? "the second pilot"} and validate repeatability.`,
      deliverables: "Prompt workflow, QA checklist, user feedback loop, change plan."
    },
    {
      id: "phase-3",
      phase: "Phase 3",
      timeline: "60-90 days",
      objective: `Scale lessons from ${topThree[2]?.name ?? "the roadmap backlog"} into a broader roadmap.`,
      deliverables: "Scaled use-case backlog, governance model, investment recommendation."
    }
  ];
}

export function buildExportSummary(
  engagement: Engagement | null,
  discovery: DiscoveryForm,
  readiness: ReadinessAssessment | null,
  useCases: UseCase[],
  roadmap: RoadmapItem[]
): ExportSummary {
  const topUseCases = useCases
    .slice(0, 5)
    .map((useCase, index) => `${index + 1}. ${useCase.name} (${useCase.score}/100) - ${useCase.rationale}`)
    .join("\n");

  const roadmapText = roadmap
    .map((item) => `${item.phase} | ${item.timeline}\nObjective: ${item.objective}\nDeliverables: ${item.deliverables}`)
    .join("\n\n");

  const content = `# ${engagement?.projectName ?? "AI Strategy OS Engagement"}

Client: ${engagement?.clientName ?? "Not set"}
Executive sponsor: ${engagement?.sponsor || "Not set"}
Industry: ${engagement?.industry || "Not set"}

## Discovery Snapshot
- Business goal: ${discovery.businessGoal || "Not set"}
- Transformation thesis: ${discovery.transformationThesis || "Not set"}
- Primary challenge: ${discovery.primaryChallenge || "Not set"}
- Success metric: ${discovery.successMetric || "Not set"}
- Constraints: ${discovery.constraints || "Not set"}

## Readiness Assessment
- Score: ${readiness?.overallScore ?? 0}/100
- Category: ${readiness?.category ?? "Not generated"}
- Summary: ${readiness?.summary ?? "Not generated"}

## Prioritized Use Cases
${topUseCases || "No use cases generated."}

## 90-Day Roadmap
${roadmapText || "No roadmap generated."}
`;

  return {
    content,
    updatedAt: new Date().toISOString()
  };
}
