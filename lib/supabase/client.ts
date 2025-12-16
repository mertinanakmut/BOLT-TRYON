import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Netlify build / prerender sırasında crash olmasın
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
