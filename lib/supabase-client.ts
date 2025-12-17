// lib/supabase-client.ts - DÜZELTİLMİŞ
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// getSupabase fonksiyonu - Varsa bu ismi kullanın
export const getSupabase = () => {
  return createClient();
};

// Veya sadece createClient export edin
export default createClient;
