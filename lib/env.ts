// lib/env.ts - DÜZELTİLMİŞ VERSİYON
import { z } from 'zod';

const envSchema = z.object({
  // === Public Environment Variables ===
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  
  // === Private Environment Variables ===
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  FAL_API_KEY: z.string().min(1),
  FAL_API_KEY_ID: z.string().min(1).optional(),
  FAL_API_KEY_SECRET: z.string().min(1).optional(),
  
  // === Security ===
  SESSION_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // === Optional Variables ===
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  FAL_API_KEY: process.env.FAL_API_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

if (!parsed.success) {
  console.error('❌ Environment variables validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment variables');
  }
}

// Parse FAL API key (keyId:keySecret format)
let falApiKeyForAuth = '';
let falKeyId = '';
let falKeySecret = '';

if (parsed.success && parsed.data.FAL_API_KEY) {
  const falKeyParts = parsed.data.FAL_API_KEY.split(':');
  if (falKeyParts.length === 2) {
    falKeyId = falKeyParts[0];
    falKeySecret = falKeyParts[1];
    // Fal AI expects "Key {keyId}:{keySecret}" format
    falApiKeyForAuth = `${falKeyId}:${falKeySecret}`;
  } else {
    // If it's already a simple key
    falApiKeyForAuth = parsed.data.FAL_API_KEY;
  }
}

export const env = {
  // Public
  NEXT_PUBLIC_SUPABASE_URL: parsed.success ? parsed.data.NEXT_PUBLIC_SUPABASE_URL : '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: parsed.success ? parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY : '',
  NEXT_PUBLIC_SITE_URL: parsed.success ? parsed.data.NEXT_PUBLIC_SITE_URL : 'http://localhost:3000',
  
  // Private
  SUPABASE_SERVICE_ROLE_KEY: parsed.success ? parsed.data.SUPABASE_SERVICE_ROLE_KEY : undefined,
  FAL_API_KEY: falApiKeyForAuth,
  FAL_KEY_ID: falKeyId,
  FAL_KEY_SECRET: falKeySecret,
  
  // Security
  SESSION_SECRET: parsed.success ? parsed.data.SESSION_SECRET : undefined,
  ENCRYPTION_KEY: parsed.success ? parsed.data.ENCRYPTION_KEY : undefined,
  
  // Runtime
  NODE_ENV: parsed.success ? parsed.data.NODE_ENV : 'development',
  LOG_LEVEL: parsed.success ? parsed.data.LOG_LEVEL : 'info',
} as const;

export type Env = z.infer<typeof envSchema>;
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Helper function to get Fal AI auth header
export function getFalAuthHeader(): string {
  return `Key ${env.FAL_API_KEY}`;
}