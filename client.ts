import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

declare global {
  interface Window { __supabase?: SupabaseClient }
  namespace NodeJS {
    interface Global { __supabaseServer?: SupabaseClient }
  }
}

export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (typeof window !== 'undefined') {
    if (!window.__supabase) {
      window.__supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          detectSessionInUrl: false
        }
      });
    }
    return window.__supabase;
  }

  // server-side singleton to avoid multiple instances during SSR
  if (!(global as any).__supabaseServer) {
    (global as any).__supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  }
  return (global as any).__supabaseServer as SupabaseClient;
}