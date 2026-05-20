import { supabase } from "../supabaseClient";

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function requireCurrentUserId() {
  const client = requireSupabase() as any;
  const {
    data: { user },
    error
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("No authenticated user is available.");
  }

  return user.id;
}
