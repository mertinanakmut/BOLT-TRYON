// lib/env.ts - DÜZELTİLMİŞ VERSİYON (TypeScript Safe)
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
  
  // === Development & Testing ===
  DEV_TEST_MODE: z.enum(['true', 'false']).default('false'),
  
  // === Security ===
  SESSION_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // === Optional Variables ===
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Environment variables'ları güvenli şekilde al
const getEnv = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Client-side'da environment variables kullanmayın
    return undefined;
  }
  return process.env[key];
};

const envData = {
  NEXT_PUBLIC_SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_SITE_URL: getEnv('NEXT_PUBLIC_SITE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  FAL_API_KEY: getEnv('FAL_API_KEY'),
  DEV_TEST_MODE: getEnv('DEV_TEST_MODE'),
  SESSION_SECRET: getEnv('SESSION_SECRET'),
  ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY'),
  NODE_ENV: getEnv('NODE_ENV'),
  LOG_LEVEL: getEnv('LOG_LEVEL'),
};

const parsed = envSchema.safeParse(envData);

// Eğer validation başarısız olursa ve production değilse, uyarı göster
if (!parsed.success) {
  const errorMessage = '❌ Environment variables validation failed';
  console.error(errorMessage);
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment variables');
  }
  
  // Development'da varsayılan değerler kullan
  console.warn('⚠️ Using default values for development');
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
    falApiKeyForAuth = `${falKeyId}:${falKeySecret}`;
  } else {
    falApiKeyForAuth = parsed.data.FAL_API_KEY;
  }
}

// Environment object'i - TypeScript safe
export const env = {
  // Public
  get NEXT_PUBLIC_SUPABASE_URL(): string {
    return parsed.success ? parsed.data.NEXT_PUBLIC_SUPABASE_URL : '';
  },
  
  get NEXT_PUBLIC_SUPABASE_ANON_KEY(): string {
    return parsed.success ? parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';
  },
  
  get NEXT_PUBLIC_SITE_URL(): string {
    return parsed.success ? parsed.data.NEXT_PUBLIC_SITE_URL : 'http://localhost:3000';
  },
  
  // Private - optional değerler için getter
  get SUPABASE_SERVICE_ROLE_KEY(): string | undefined {
    return parsed.success ? parsed.data.SUPABASE_SERVICE_ROLE_KEY : undefined;
  },
  
  get FAL_API_KEY(): string {
    return falApiKeyForAuth;
  },
  
  get FAL_KEY_ID(): string {
    return falKeyId;
  },
  
  get FAL_KEY_SECRET(): string {
    return falKeySecret;
  },
  
  // Development & Testing
  get DEV_TEST_MODE(): boolean {
    return parsed.success ? (parsed.data.DEV_TEST_MODE === 'true') : false;
  },
  
  // Security - optional değerler
  get SESSION_SECRET(): string | undefined {
    return parsed.success ? parsed.data.SESSION_SECRET : undefined;
  },
  
  get ENCRYPTION_KEY(): string | undefined {
    return parsed.success ? parsed.data.ENCRYPTION_KEY : undefined;
  },
  
  // Runtime
  get NODE_ENV(): string {
    return parsed.success ? parsed.data.NODE_ENV : 'development';
  },
  
  get LOG_LEVEL(): string {
    return parsed.success ? parsed.data.LOG_LEVEL : 'info';
  },
};

// Type definitions
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Helper function to get Fal AI auth header
export function getFalAuthHeader(): string {
  return `Key ${env.FAL_API_KEY}`;
}

// Environment validation check (sadece server-side)
export function checkEnv(): void {
  if (typeof window === 'undefined') {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'FAL_API_KEY'
    ];
    
    const missingVars = requiredVars.filter(key => {
      const value = getEnv(key);
      return !value || value.trim() === '';
    });
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.error('Please check your .env.local file');
      
      if (isProduction) {
        throw new Error('Missing required environment variables');
      }
    } else {
      console.log('✅ Environment variables loaded successfully');
    }
  }
}

// Initialize check on import
if (typeof window === 'undefined' && isDevelopment) {
  checkEnv();
}