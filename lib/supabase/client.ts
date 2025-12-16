import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

declare global {
	// allow storing the client on globalThis to survive HMR and multiple imports
	// eslint-disable-next-line no-var
	var __supabase_client__: SupabaseClient | undefined;
}

// Export a single client instance for the browser and a safe server fallback
export const supabase: SupabaseClient =
	typeof window === 'undefined'
		? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) // server: fine to create per process/request
		: (globalThis.__supabase_client__ ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY));

export default supabase;
