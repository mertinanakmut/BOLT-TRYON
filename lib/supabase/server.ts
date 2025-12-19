export const runtime = 'nodejs';
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Environment değişkenlerini güvenli şekilde al
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`Environment variable ${key} is not defined`);
    
    // Development'da fallback değerler
    if (process.env['NODE_ENV'] === 'development') {
      console.warn(`⚠️ Using fallback value for ${key}`);
      return key.includes('SUPABASE_URL') 
        ? 'https://default.supabase.co' 
        : 'default-anon-key';
    }
    
    // Production'da hata
    throw new Error(`${key} is not defined in environment variables`);
  }
  return value;
};

// Server-side helper that returns a Supabase client configured with env keys.
export function createServerSupabase(): SupabaseClient {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  console.log(`Creating Supabase client for ${url.substring(0, 30)}...`);
  
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

// Backwards-compatible export expected by imports elsewhere in the app
export async function createClient(): Promise<SupabaseClient> {
  return createServerSupabase();
}

// Utility function to check if user is authenticated
export async function getAuthUser(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

// Utility function to get user profile
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Profile fetch error:', error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

// Helper function to check environment variables on startup
export function checkSupabaseEnv() {
  if (typeof window === 'undefined') {
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const missingVars = requiredVars.filter(key => !process.env[key]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing Supabase environment variables:', missingVars);
      
      if (process.env['NODE_ENV'] === 'production') {
        throw new Error('Missing required environment variables');
      } else {
        console.warn('⚠️ Development mode: Using fallback values');
      }
    } else {
      console.log('✅ Supabase environment variables loaded successfully');
    }
  }
}

// Check environment variables on import (server-side only)
if (typeof window === 'undefined') {
  checkSupabaseEnv();
}