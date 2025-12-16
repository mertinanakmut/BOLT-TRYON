import { createClient, SupabaseClient } from '@supabase/supabase-js';

// prefer NEXT_PUBLIC_* on the client; fallback to SUPABASE_* (server) when needed
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim() || undefined;
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim() || undefined;

declare global {
  interface Window { __supabase?: SupabaseClient }
  namespace NodeJS {
    interface Global { __supabaseServer?: SupabaseClient }
  }
}

// create (or reuse) a single Supabase client instance for the whole runtime
function createSingletonClient(): SupabaseClient {
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

  if (!(global as any).__supabaseServer) {
    (global as any).__supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  }
  return (global as any).__supabaseServer as SupabaseClient;
}

// module-level singleton instance
const supabase = createSingletonClient();

export function getSupabase(): SupabaseClient {
  return supabase;
}

export default supabase;