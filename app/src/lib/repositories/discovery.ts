import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type DiscoveryRow = Database["public"]["Tables"]["discovery_responses"]["Row"];
type DiscoveryInsert = Database["public"]["Tables"]["discovery_responses"]["Insert"];

export async function getDiscoveryByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("discovery_responses")
    .select("*")
    .eq("engagement_id", engagementId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as DiscoveryRow | null;
}

export async function upsertDiscovery(payload: DiscoveryInsert): Promise<DiscoveryRow> {
  const client = requireSupabase() as any;
  const { data: existing, error: existingError } = await client
    .from("discovery_responses")
    .select("id")
    .eq("engagement_id", payload.engagement_id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const nextPayload = existing ? { ...payload, id: existing.id } : payload;
  const { data, error } = await client
    .from("discovery_responses")
    .upsert(nextPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DiscoveryRow;
}
