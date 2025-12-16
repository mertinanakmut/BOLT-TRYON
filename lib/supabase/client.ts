import { createClient } from '@supabase/supabase-js';

// Debug için environment değişkenlerini kontrol et
console.log('🟡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('🟡 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Supabase client'ı oluştur
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce', // PKCE flow kullan (daha güvenli)
    },
  }
);