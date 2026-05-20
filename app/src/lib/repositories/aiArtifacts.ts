import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type AIArtifactRow = Database["public"]["Tables"]["ai_artifacts"]["Row"];
type AIArtifactInsert = Database["public"]["Tables"]["ai_artifacts"]["Insert"];

export async function listAIArtifactsByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("ai_artifacts")
    .select("*")
    .eq("engagement_id", engagementId)
    .order("artifact_type", { ascending: true })
    .order("version_number", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AIArtifactRow[];
}

export async function createAIArtifactVersion(payload: AIArtifactInsert): Promise<AIArtifactRow> {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("ai_artifacts")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AIArtifactRow;
}

export async function getCurrentAIArtifact(engagementId: string, artifactType: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("ai_artifacts")
    .select("*")
    .eq("engagement_id", engagementId)
    .eq("artifact_type", artifactType)
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as AIArtifactRow | null;
}

export async function setCurrentAIArtifact(artifactId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("ai_artifacts")
    .update({ is_current: true })
    .eq("id", artifactId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AIArtifactRow;
}

export async function clearCurrentAIArtifacts(engagementId: string, artifactType: string) {
  const client = requireSupabase() as any;
  const { error } = await client
    .from("ai_artifacts")
    .update({ is_current: false })
    .eq("engagement_id", engagementId)
    .eq("artifact_type", artifactType)
    .eq("is_current", true);

  if (error) {
    throw error;
  }
}
