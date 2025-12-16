import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

declare global {
  // eslint-disable-next-line no-var
  var __supabase_client__: SupabaseClient | undefined;
}

// ✅ TEK client – browser singleton
export const supabase: SupabaseClient =
  globalThis.__supabase_client__ ??
  (globalThis.__supabase_client__ = createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  ));

// ❌ Browser’da yeni client üretme
export function createClient() {
  if (typeof window !== 'undefined') {
    return supabase;
  }
  // server tarafında güvenli
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Geri uyumluluk
export const getSupabase = () => supabase;

export default supabase;
