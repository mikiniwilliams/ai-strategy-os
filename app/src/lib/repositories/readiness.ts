import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type ReadinessRow = Database["public"]["Tables"]["readiness_assessments"]["Row"];
type ReadinessInsert = Database["public"]["Tables"]["readiness_assessments"]["Insert"];

export async function getReadinessByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("readiness_assessments")
    .select("*")
    .eq("engagement_id", engagementId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ReadinessRow | null;
}

export async function upsertReadiness(payload: ReadinessInsert): Promise<ReadinessRow> {
  const client = requireSupabase() as any;
  const { data: existing, error: existingError } = await client
    .from("readiness_assessments")
    .select("id")
    .eq("engagement_id", payload.engagement_id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const nextPayload = existing ? { ...payload, id: existing.id } : payload;
  const { data, error } = await client
    .from("readiness_assessments")
    .upsert(nextPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ReadinessRow;
}
