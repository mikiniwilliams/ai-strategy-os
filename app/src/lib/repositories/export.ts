import type { Database } from "../supabase.types";
import { requireSupabase } from "./helpers";

type ExportRow = Database["public"]["Tables"]["export_summaries"]["Row"];
type ExportInsert = Database["public"]["Tables"]["export_summaries"]["Insert"];

export async function getExportSummaryByEngagementId(engagementId: string) {
  const client = requireSupabase() as any;
  const { data, error } = await client
    .from("export_summaries")
    .select("*")
    .eq("engagement_id", engagementId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ExportRow | null;
}

export async function upsertExportSummary(payload: ExportInsert): Promise<ExportRow> {
  const client = requireSupabase() as any;
  const { data: existing, error: existingError } = await client
    .from("export_summaries")
    .select("id")
    .eq("engagement_id", payload.engagement_id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const nextPayload = existing ? { ...payload, id: existing.id } : payload;
  const { data, error } = await client
    .from("export_summaries")
    .upsert(nextPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ExportRow;
}
