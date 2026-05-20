import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { aiArtifactSchemaMap, aiRequestStateSchema, validateAIArtifact } from "../app/src/lib/aiSchemas";
import { applyRateLimit } from "./_lib/rateLimit";

const requestSchema = z.object({
  engagementId: z.string().uuid().nullable(),
  kind: z.enum([
    "discovery_summary",
    "readiness_narrative",
    "use_case_assistant",
    "roadmap_draft",
    "export_executive_summary"
  ]),
  state: aiRequestStateSchema
});

function logEvent(event: string, metadata: Record<string, string | number | boolean | null>) {
  console.info(`[ai-assist] ${event}`, metadata);
}

function buildPrompt(kind: keyof typeof aiArtifactSchemaMap, state: z.infer<typeof aiRequestStateSchema>) {
  const header = `You are assisting a strategy consultant using AI Strategy OS.
Keep the response concise, professional, client-ready, and grounded only in the provided data.
Do not change or contradict the deterministic scores, rankings, or roadmap structure.
Do not include markdown tables, XML, HTML, code fences, or fabricated facts.
Return only short structured business language that fits the schema.`;

  const context = JSON.stringify(state, null, 2);

  const prompts: Record<keyof typeof aiArtifactSchemaMap, string> = {
    discovery_summary: `${header}
Summarize the engagement from discovery responses only.
Highlight the business goal, transformation thesis, main challenge, constraints, likely opportunities, and key risks.
Context:
${context}`,
    readiness_narrative: `${header}
Turn the readiness assessment into plain-English guidance.
Explain why the score is high or low, identify blockers, and propose next actions.
Keep the narrative aligned to the deterministic readiness score and dimensions.
Context:
${context}`,
    use_case_assistant: `${header}
Suggest additive use-case framing that complements, but does not replace, the current ranked use cases.
Group ideas into quick wins, strategic bets, and watchouts.
Reference the discovery and readiness context.
Context:
${context}`,
    roadmap_draft: `${header}
Generate a readable 30/60/90-day narrative that matches the current roadmap and engagement context.
Do not invent extra phases beyond what the roadmap implies.
Context:
${context}`,
    export_executive_summary: `${header}
Generate an executive summary, recommendation, and next steps that can sit above the existing export summary.
Keep it crisp and client-ready.
Context:
${context}`
  };

  return prompts[kind];
}

export default async function handler(request: Request) {
  const startedAt = Date.now();

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY.", { status: 500 });
  }

  try {
    const sessionId = request.headers.get("x-ai-session") ?? "anonymous";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimit = applyRateLimit(`${sessionId}:${ip}`);

    if (!rateLimit.allowed) {
      logEvent("rate_limited", {
        route: "ai-assist",
        success: false,
        retryAfterSeconds: rateLimit.retryAfterSeconds
      });

      return Response.json(
        {
          error: `AI Assist is temporarily rate limited. Please wait about ${rateLimit.retryAfterSeconds} seconds and try again.`
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const parsed = requestSchema.parse(await request.json());
    logEvent("request_received", {
      route: "ai-assist",
      artifactType: parsed.kind,
      engagementId: parsed.engagementId,
      success: true
    });

    const { object } = await generateObject({
      model: openai("gpt-4.1-mini"),
      schema: aiArtifactSchemaMap[parsed.kind],
      prompt: buildPrompt(parsed.kind, parsed.state)
    });

    const artifact = validateAIArtifact(parsed.kind, object);
    const latencyMs = Date.now() - startedAt;

    logEvent("request_completed", {
      route: "ai-assist",
      artifactType: parsed.kind,
      engagementId: parsed.engagementId,
      success: true,
      latencyMs
    });

    return Response.json({ artifact });
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const isValidationError = error instanceof z.ZodError;
    const safeMessage = isValidationError
      ? "AI Assist could not validate the generated output. Please try again."
      : "AI Assist could not complete this request. You can continue with the deterministic workflow.";

    logEvent("request_failed", {
      route: "ai-assist",
      success: false,
      latencyMs,
      validationError: isValidationError
    });

    return Response.json({ error: safeMessage }, { status: isValidationError ? 422 : 500 });
  }
}
