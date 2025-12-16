import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    // build / prerender sırasında patlamasın
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Backwards-compatible export expected by other modules in the app
export function createClient(): SupabaseClient {
  // Throw here so callers are aware if env vars are missing at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
