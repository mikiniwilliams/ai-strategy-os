import { initialState } from "./defaults";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { AppState, Engagement, SavedEngagementSummary } from "./types";

const TABLE_NAME = "engagements";

interface EngagementRow {
  id: string;
  project_name: string;
  client_name: string;
  sponsor: string;
  industry: string;
  status: string;
  updated_at: string;
  created_at: string;
  snapshot: AppState;
}

function buildSummary(row: EngagementRow): SavedEngagementSummary {
  return {
    id: row.id,
    projectName: row.project_name,
    clientName: row.client_name,
    sponsor: row.sponsor,
    industry: row.industry,
    status: row.status,
    updatedAt: row.updated_at,
    createdAt: row.created_at
  };
}

function buildRow(engagement: Engagement, state: AppState) {
  return {
    id: engagement.id,
    project_name: engagement.projectName,
    client_name: engagement.clientName,
    sponsor: engagement.sponsor,
    industry: engagement.industry,
    status: engagement.status,
    created_at: engagement.createdAt,
    snapshot: state
  };
}

export async function listSavedEngagements(): Promise<SavedEngagementSummary[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, project_name, client_name, sponsor, industry, status, updated_at, created_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => buildSummary(row as EngagementRow));
}

export async function loadSavedEngagement(id: string): Promise<AppState | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.from(TABLE_NAME).select("snapshot").eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.snapshot) {
    return null;
  }

  return { ...initialState, ...(data.snapshot as AppState) };
}

export async function upsertSavedEngagement(state: AppState) {
  if (!isSupabaseConfigured || !supabase || !state.engagement) {
    return;
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(buildRow(state.engagement, state), {
    onConflict: "id"
  });

  if (error) {
    throw error;
  }
}
