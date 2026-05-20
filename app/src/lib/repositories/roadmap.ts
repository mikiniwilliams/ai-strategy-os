import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type RoadmapRow = Database["public"]["Tables"]["roadmap_items"]["Row"];
type RoadmapInsert = Database["public"]["Tables"]["roadmap_items"]["Insert"];

export async function listRoadmapItemsByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("roadmap_items")
    .select("*")
    .eq("engagement_id", engagementId)
    .order("phase_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as RoadmapRow[];
}

export async function replaceRoadmapItems(engagementId: string, payload: RoadmapInsert[]): Promise<RoadmapRow[]> {
  const client = requireSupabase() as any;
  const { error: deleteError } = await client.from("roadmap_items").delete().eq("engagement_id", engagementId);

  if (deleteError) {
    throw deleteError;
  }

  if (!payload.length) {
    return [];
  }

  const { data, error } = await client
    .from("roadmap_items")
    .insert(payload)
    .select()
    .order("phase_number", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as RoadmapRow[];
}
