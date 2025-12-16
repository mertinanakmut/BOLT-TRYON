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

// lazy singleton holder
let supabaseInstance: SupabaseClient | null = null;

function initSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (or their SUPABASE_* fallbacks)');
  }

  if (typeof window !== 'undefined') {
    if (!window.__supabase) {
      window.__supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, detectSessionInUrl: false }
      });
    }
    supabaseInstance = window.__supabase;
    return supabaseInstance;
  }

  if (!(global as any).__supabaseServer) {
    (global as any).__supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  }
  supabaseInstance = (global as any).__supabaseServer as SupabaseClient;
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient {
  return initSupabase();
}

// keep default export compatible with previous usage (call to getSupabase required to obtain instance)
export default getSupabase;