import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

declare global {
	// persist the client across module reloads / HMR
	// eslint-disable-next-line no-var
	var __supabase_client__: SupabaseClient | undefined;
}

export function getSupabaseClient(): SupabaseClient {
	// Server: create a new client per-call (stateless)
	if (typeof window === 'undefined') {
		return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
	}

	// Browser: reuse or create a single global client
	if (!globalThis.__supabase_client__) {
		globalThis.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
	}
	return globalThis.__supabase_client__;
}

export default getSupabaseClient;
