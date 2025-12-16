import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

declare global {
  // eslint-disable-next-line no-var
  var __supabase_client__: SupabaseClient | undefined;
}

/**
 * ✅ Factory function (beklenen export)
 */
export function createClient(): SupabaseClient {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * ✅ Geri uyumluluk (login page bunu çağırıyor)
 */
export const getSupabase = createClient;

/**
 * ✅ Singleton client (mevcut kullanım bozulmaz)
 */
export const supabase: SupabaseClient =
  typeof window === 'undefined'
    ? createClient()
    : (globalThis.__supabase_client__ ??= createClient());

export default supabase;
