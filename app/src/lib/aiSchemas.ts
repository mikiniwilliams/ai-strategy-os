import { z } from "zod";

function sanitizeValue(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const sanitizedString = z.string().max(4000).transform(sanitizeValue);
const shortSanitizedString = z.string().max(280).transform(sanitizeValue);

const boundedStringArray = z.array(shortSanitizedString).min(2).max(6);

export const sanitizedEngagementSchema = z
  .object({
    projectName: shortSanitizedString,
    clientName: shortSanitizedString,
    sponsor: shortSanitizedString,
    industry: shortSanitizedString,
    status: shortSanitizedString,
    notes: sanitizedString
  })
  .nullable();

export const sanitizedDiscoverySchema = z.object({
  businessGoal: sanitizedString,
  transformationThesis: sanitizedString,
  primaryChallenge: sanitizedString,
  currentAiMaturity: z.enum(["nascent", "piloting", "scaling"]),
  dataEnvironment: z.enum(["fragmented", "developing", "strong"]),
  processDiscipline: z.enum(["manual", "mixed", "structured"]),
  teamReadiness: z.enum(["hesitant", "curious", "committed"]),
  budgetHorizon: z.enum(["limited", "moderate", "funded"]),
  successMetric: sanitizedString,
  constraints: sanitizedString
});

export const sanitizedReadinessSchema = z
  .object({
    overallScore: z.number().int().min(0).max(100),
    category: shortSanitizedString,
    summary: sanitizedString,
    dimensions: z
      .array(
        z.object({
          label: shortSanitizedString,
          score: z.number().int().min(0).max(100),
          note: sanitizedString
        })
      )
      .length(5),
    recommendations: z.array(sanitizedString).min(1).max(6)
  })
  .nullable();

export const sanitizedUseCaseSchema = z.object({
  name: shortSanitizedString,
  description: sanitizedString,
  impact: z.number().int().min(0).max(100),
  feasibility: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100),
  rationale: sanitizedString
});

export const sanitizedRoadmapSchema = z.object({
  phase: shortSanitizedString,
  timeline: shortSanitizedString,
  objective: sanitizedString,
  deliverables: sanitizedString
});

export const sanitizedExportSummarySchema = z
  .object({
    content: z.string().max(12000),
    updatedAt: shortSanitizedString
  })
  .nullable();

export const aiRequestStateSchema = z.object({
  engagement: sanitizedEngagementSchema,
  discovery: sanitizedDiscoverySchema,
  readiness: sanitizedReadinessSchema,
  useCases: z.array(sanitizedUseCaseSchema).max(12),
  roadmap: z.array(sanitizedRoadmapSchema).max(6),
  exportSummary: sanitizedExportSummarySchema
});

export const aiArtifactSchemaMap = {
  discovery_summary: z.object({
    summary: sanitizedString,
    likelyOpportunities: boundedStringArray,
    keyRisks: boundedStringArray
  }),
  readiness_narrative: z.object({
    explanation: sanitizedString,
    blockers: boundedStringArray,
    nextActions: boundedStringArray
  }),
  use_case_assistant: z.object({
    overview: sanitizedString,
    quickWins: z.object({
      title: shortSanitizedString,
      items: boundedStringArray
    }),
    strategicBets: z.object({
      title: shortSanitizedString,
      items: boundedStringArray
    }),
    watchouts: z.object({
      title: shortSanitizedString,
      items: boundedStringArray
    })
  }),
  roadmap_draft: z.object({
    narrative: sanitizedString,
    days30: boundedStringArray,
    days60: boundedStringArray,
    days90: boundedStringArray
  }),
  export_executive_summary: z.object({
    executiveSummary: sanitizedString,
    recommendation: sanitizedString,
    nextSteps: z.array(shortSanitizedString).min(3).max(6)
  })
} as const;

export type AIArtifactSchemaMap = typeof aiArtifactSchemaMap;

export function validateAIArtifact<K extends keyof AIArtifactSchemaMap>(kind: K, value: unknown) {
  return aiArtifactSchemaMap[kind].parse(value);
}
