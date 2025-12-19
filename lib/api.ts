// lib/api.ts - TAMAMEN DÜZELTİLMİŞ
import { createClient } from '@supabase/supabase-js';

// Environment variables için güvenli fonksiyon
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side'da env vars kullanmayın
    throw new Error(`Cannot access ${key} on client side`);
  }
  
  const value = process.env[key];
  if (!value) {
    // Development'da sadece uyarı, production'da hata
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`${key} is not defined in environment variables`);
    }
    
    console.warn(`⚠️ ${key} is not defined in environment variables`);
    
    // Development için varsayılan değerler
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://default.supabase.co';
    }
    if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-anon-key';
    }
    return value || '';
  }
  return value;
};

// Type-safe Supabase client oluşturma
const createSupabaseClient = () => {
  try {
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
};

// File to Base64 conversion
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Main try-on generation function
export async function generateTryOn(payload: {
  modelImage: string;
  tshirtImage: string;
  generateVideo?: boolean;
}): Promise<any> {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const res = await fetch('/api/tryon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      data = null;
    }

    // Log API response for debugging
    console.log('🔍 API Response Details:', {
      status: res.status,
      ok: res.ok,
      data,
      dataType: typeof data,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
    });

    if (!res.ok) {
      console.error('❌ API Request Failed:', {
        status: res.status,
        statusText: res.statusText,
        responseText: text.substring(0, 500),
        data
      });
      
      throw {
        error: 'request_failed',
        status: res.status,
        message: res.statusText,
        details: data?.error || text.substring(0, 200)
      };
    }

    // Validate response structure
    if (!data) {
      throw new Error('Empty response from API');
    }

    // Check for success in response
    if (data.success === false) {
      throw {
        error: 'api_error',
        message: data.error || 'API returned unsuccessful response',
        details: data
      };
    }

    return data;
  } catch (error) {
    console.error('🔥 generateTryOn Error:', error);
    throw error;
  }
}

// Image upload function
export async function uploadImage(file: File, bucket: string): Promise<any> {
  try {
    const supabase = createSupabaseClient();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('uploadImage Error:', error);
    throw error;
  }
}

// Image file validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Please use JPEG, PNG, WebP, or GIF.`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum of ${formatFileSize(maxSize)}`
    };
  }

  return { valid: true };
}

// Generate random ID
export function generateRandomId(): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36);
  return `${randomPart}-${timePart}`;
}

// Utility delay function
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries - 1) break;
      
      const delayMs = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms`);
      await delay(delayMs);
    }
  }
  
  throw lastError;
}

// API response type definitions
export interface TryOnResponse {
  success?: boolean;
  data?: {
    imageUrl: string;
    videoUrl?: string | null;
    generationTimeMs?: number;
    remainingCredits?: number;
    requestId?: string;
    historyId?: string;
    [key: string]: any;
  };
  imageUrl?: string;
  videoUrl?: string | null;
  generationTimeMs?: number;
  remainingCredits?: number;
  error?: string;
  message?: string;
  [key: string]: any;
}

// Type guard for TryOnResponse
export function isTryOnResponse(obj: any): obj is TryOnResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (
      typeof obj.success === 'boolean' ||
      typeof obj.imageUrl === 'string' ||
      typeof obj.data?.imageUrl === 'string'
    )
  );
}

// Extract image URL from response (handles different response formats)
export function extractImageUrl(response: any): string | null {
  if (!response) return null;
  
  // Format 1: response.data.imageUrl
  if (response.data?.imageUrl && typeof response.data.imageUrl === 'string') {
    return response.data.imageUrl;
  }
  
  // Format 2: response.imageUrl
  if (response.imageUrl && typeof response.imageUrl === 'string') {
    return response.imageUrl;
  }
  
  // Format 3: response.url or response.output
  if (response.url && typeof response.url === 'string') {
    return response.url;
  }
  
  if (response.output && typeof response.output === 'string') {
    return response.output;
  }
  
  // Format 4: Search in nested objects
  const searchForUrl = (obj: any): string | null => {
    if (typeof obj === 'string' && obj.startsWith('http')) {
      return obj;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.toLowerCase().includes('url') && typeof obj[key] === 'string' && obj[key].startsWith('http')) {
          return obj[key];
        }
        
        const found = searchForUrl(obj[key]);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  return searchForUrl(response);
}

// Helper to check if URL is valid
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Create a test response for development
export function createMockTryOnResponse(): TryOnResponse {
  return {
    success: true,
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop',
      generationTimeMs: 2450,
      remainingCredits: 13,
      requestId: 'test-' + generateRandomId(),
      historyId: 'history-' + generateRandomId(),
    }
  };
}

// Development mock function
export async function mockGenerateTryOn(payload: any): Promise<TryOnResponse> {
  console.log('🔧 MOCK generateTryOn called with:', {
    modelImageLength: payload.modelImage?.length,
    tshirtImageLength: payload.tshirtImage?.length,
    generateVideo: payload.generateVideo
  });
  
  await delay(2000); // Simulate processing time
  
  return createMockTryOnResponse();
}

// Check if we should use mock mode
export function shouldUseMock(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.USE_MOCK_API === 'true';
}

// Main export with mock support
export async function generateTryOnWithMock(payload: {
  modelImage: string;
  tshirtImage: string;
  generateVideo?: boolean;
}): Promise<any> {
  if (shouldUseMock()) {
    console.warn('⚠️ Using mock API mode');
    return mockGenerateTryOn(payload);
  }
  
  return generateTryOn(payload);
}