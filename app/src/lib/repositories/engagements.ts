import type { Database } from "../supabase.types";
import { requireCurrentUserId, requireSupabase } from "./helpers";

type EngagementRow = Database["public"]["Tables"]["engagements"]["Row"];
type EngagementInsert = Database["public"]["Tables"]["engagements"]["Insert"];

export async function listEngagements() {
  const client = requireSupabase() as any;
  const userId = await requireCurrentUserId();
  const { data, error } = await client
    .from("engagements")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as EngagementRow[];
}

export async function getEngagement(id: string): Promise<EngagementRow | null> {
  const client = requireSupabase() as any;
  const { data, error } = await client.from("engagements").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as EngagementRow | null;
}

export async function getLatestEngagement() {
  const engagements = await listEngagements();
  return engagements[0] ?? null;
}

export async function upsertEngagement(payload: EngagementInsert): Promise<EngagementRow> {
  const client = requireSupabase() as any;
  const userId = await requireCurrentUserId();
  const { data, error } = await client
    .from("engagements")
    .upsert({ ...payload, user_id: userId }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as EngagementRow;
}
