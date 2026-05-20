import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type UseCaseRow = Database["public"]["Tables"]["prioritized_use_cases"]["Row"];
type UseCaseInsert = Database["public"]["Tables"]["prioritized_use_cases"]["Insert"];

export async function listUseCasesByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("prioritized_use_cases")
    .select("*")
    .eq("engagement_id", engagementId)
    .order("rank_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as UseCaseRow[];
}

export async function replaceUseCases(engagementId: string, payload: UseCaseInsert[]): Promise<UseCaseRow[]> {
  const client = requireSupabase() as any;
  const { error: deleteError } = await client.from("prioritized_use_cases").delete().eq("engagement_id", engagementId);

  if (deleteError) {
    throw deleteError;
  }

  if (!payload.length) {
    return [];
  }

  const { data, error } = await client
    .from("prioritized_use_cases")
    .insert(payload)
    .select()
    .order("rank_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as UseCaseRow[];
}
