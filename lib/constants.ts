// lib/constants.ts - TAM VERSİYON
// API Constants
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Application Constants
export const APP = {
  NAME: 'TryOn AI',
  DESCRIPTION: 'Yapay zeka destekli sanal giyinme uygulaması',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'tr',
  SUPPORTED_LANGUAGES: ['tr', 'en'] as const,
} as const;

// Credit System
export const CREDITS = {
  DEFAULT_FREE_CREDITS: 5,
  PRICE_PER_CREDIT: 1, // $1 per credit
  TRYON_COST: 1, // 1 credit per try-on
  TRYON_VIDEO_COST: 2, // 2 credits for video
  MAX_FREE_CREDITS: 10,
  SUBSCRIPTION_MONTHLY_CREDITS: 100,
} as const;

// Storage Constants
export const STORAGE = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_IMAGES_PER_USER: 50,
  IMAGE_PREVIEW_LENGTH: 200, // Base64 preview length
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_LIMIT: 20,
  LOADING_TIMEOUT: 30000,
} as const;

// API Timeouts
export const TIMEOUTS = {
  FAL_API: 60000, // 60 seconds
  SUPABASE: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
} as const;

// Status Codes
export const STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error Messages
export const ERRORS = {
  AUTH: {
    UNAUTHORIZED: 'Bu işlem için giriş yapmalısınız',
    INVALID_CREDENTIALS: 'Email veya şifre hatalı',
    SESSION_EXPIRED: 'Oturumunuz sona erdi, lütfen tekrar giriş yapın',
    NO_PROFILE: 'Kullanıcı profili bulunamadı',
    FORBIDDEN: 'Bu işlemi yapmaya yetkiniz yok',
  },
  VALIDATION: {
    REQUIRED: 'Bu alan zorunludur',
    INVALID_EMAIL: 'Geçerli bir email adresi girin',
    PASSWORD_MIN: 'Şifre en az 6 karakter olmalı',
    FILE_TOO_LARGE: `Dosya boyutu ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB'dan küçük olmalı`,
    INVALID_IMAGE: 'Geçerli bir görsel yükleyin',
    INVALID_BASE64: 'Geçersiz Base64 formatı',
    INVALID_FORMAT: 'Geçersiz format',
  },
  API: {
    RATE_LIMIT: 'Çok fazla istek gönderdiniz, lütfen bekleyin',
    SERVER_ERROR: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
    NETWORK_ERROR: 'Ağ bağlantısı hatası',
    TIMEOUT: 'İstek zaman aşımına uğradı',
    INSUFFICIENT_CREDITS: 'Yetersiz kredi',
    CONCURRENT_REQUEST: 'Zaten devam eden bir deneme işleminiz var',
  },
  FAL: {
    API_KEY_MISSING: 'FAL API anahtarı eksik',
    PROCESSING_FAILED: 'AI işleme başarısız oldu',
    INVALID_RESPONSE: 'Geçersiz AI yanıtı',
    QUOTA_EXCEEDED: 'API kotası aşıldı',
  },
  DATABASE: {
    CONNECTION_FAILED: 'Veritabanı bağlantısı başarısız',
    QUERY_FAILED: 'Veritabanı sorgusu başarısız',
    CONSTRAINT_VIOLATION: 'Veritabanı kısıtlaması ihlal edildi',
  },
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

// Database Table Names
export const TABLES = {
  PROFILES: 'profiles',
  TRYON_HISTORY: 'tryon_history',
  SUBSCRIPTIONS: 'subscriptions',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  GARMENTS: 'garments',
} as const;

// Garment Categories
export const GARMENT_CATEGORIES = [
  'tshirt',
  'shirt',
  'dress',
  'pants',
  'jeans',
  'jacket',
  'coat',
  'skirt',
  'shorts',
  'sweater',
  'hoodie',
] as const;

// TryOn Statuses
export const TRYON_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_CREDITS: (userId: string) => `user:${userId}:credits`,
  TRYON_HISTORY: (userId: string) => `user:${userId}:tryon-history`,
  API_RATE_LIMIT: (ip: string) => `rate-limit:${ip}`,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_VIDEO_GENERATION: true,
  ENABLE_MULTIPLE_GARMENTS: false,
  ENABLE_BATCH_PROCESSING: false,
  ENABLE_REAL_TIME_UPDATES: true,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  TRYON_STARTED: 'tryon_started',
  TRYON_COMPLETED: 'tryon_completed',
  TRYON_FAILED: 'tryon_failed',
  CREDITS_PURCHASED: 'credits_purchased',
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
} as const;