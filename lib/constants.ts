// lib/constants.ts - TAM VERSİYON
// API Constants
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// FAL AI Constants
export const FAL_AI = {
  API_URL: 'https://fal.run/fal-ai',
  MODELS: {
    FACE_TO_MANY: 'face-to-many',
    CLOTHING_TRYON: 'clothing-tryon',
    OUTFIT_ANYONE: 'outfit-anyone'
  },
  DEFAULT_MODEL: 'face-to-many',
  TIMEOUT: 60000, // 60 seconds
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'] as const,
  // Fal AI rate limits
  RATE_LIMIT: {
    FREE: 10, // 10 requests per hour
    PREMIUM: 100, // 100 requests per hour
    ENTERPRISE: 1000 // 1000 requests per hour
  }
} as const;

// Application Constants
export const APP = {
  NAME: 'TryOn AI',
  DESCRIPTION: 'Yapay zeka destekli sanal giyinme uygulaması',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'tr',
  SUPPORTED_LANGUAGES: ['tr', 'en'] as const,
  MAX_CONCURRENT_JOBS: 1, // Kullanıcı başına aynı anda çalışan maksimum iş
} as const;

// Credit System
export const CREDITS = {
  DEFAULT_FREE_CREDITS: 5,
  PRICE_PER_CREDIT: 1, // $1 per credit
  TRYON_COST: 1, // 1 credit per try-on
  TRYON_VIDEO_COST: 2, // 2 credits for video
  MAX_FREE_CREDITS: 10,
  SUBSCRIPTION_MONTHLY_CREDITS: 100,
  // Fal AI cost mapping
  FAL_AI_COST: {
    'face-to-many': 1,
    'clothing-tryon': 2,
    'outfit-anyone': 3
  }
} as const;

// Storage Constants
export const STORAGE = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_IMAGES_PER_USER: 50,
  IMAGE_PREVIEW_LENGTH: 200, // Base64 preview length
  TEMP_UPLOAD_EXPIRY: 3600, // 1 hour in seconds
} as const;

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_LIMIT: 20,
  LOADING_TIMEOUT: 30000,
  TRYON_PROCESSING_TIMEOUT: 120000, // 2 minutes for AI processing
} as const;

// API Timeouts
export const TIMEOUTS = {
  FAL_API: 60000, // 60 seconds
  SUPABASE: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
  DATABASE: 5000, // 5 seconds
  EXTERNAL_API: 45000, // 45 seconds
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
  PROCESSING: 102, // Processing
  INSUFFICIENT_STORAGE: 507,
} as const;

// Error Codes (Specific error codes for better client handling)
export const ERROR_CODES = {
  // Auth errors
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_IMAGE_FORMAT: 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE: 'IMAGE_TOO_LARGE',
  
  // Credit errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  CREDIT_PROCESSING_FAILED: 'CREDIT_PROCESSING_FAILED',
  
  // API errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CONCURRENT_REQUEST: 'CONCURRENT_REQUEST',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  
  // Fal AI errors
  FAL_API_KEY_MISSING: 'FAL_API_KEY_MISSING',
  FAL_PROCESSING_FAILED: 'FAL_PROCESSING_FAILED',
  FAL_RATE_LIMITED: 'FAL_RATE_LIMITED',
  FAL_INVALID_RESPONSE: 'FAL_INVALID_RESPONSE',
  FAL_QUOTA_EXCEEDED: 'FAL_QUOTA_EXCEEDED',
  FAL_MODEL_UNAVAILABLE: 'FAL_MODEL_UNAVAILABLE',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  
  // File errors
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Error Messages
export const ERRORS = {
  AUTH: {
    UNAUTHORIZED: 'Bu işlem için giriş yapmalısınız',
    INVALID_CREDENTIALS: 'Email veya şifre hatalı',
    SESSION_EXPIRED: 'Oturumunuz sona erdi, lütfen tekrar giriş yapın',
    NO_PROFILE: 'Kullanıcı profili bulunamadı',
    FORBIDDEN: 'Bu işlemi yapmaya yetkiniz yok',
    INVALID_TOKEN: 'Geçersiz kimlik doğrulama tokenı',
  },
  VALIDATION: {
    REQUIRED: 'Bu alan zorunludur',
    INVALID_EMAIL: 'Geçerli bir email adresi girin',
    PASSWORD_MIN: 'Şifre en az 6 karakter olmalı',
    FILE_TOO_LARGE: `Dosya boyutu ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB'dan küçük olmalı`,
    INVALID_IMAGE: 'Geçerli bir görsel yükleyin (JPEG, PNG, WebP)',
    INVALID_BASE64: 'Geçersiz Base64 formatı',
    INVALID_FORMAT: 'Geçersiz format',
    IMAGE_CORRUPTED: 'Görsel dosyası bozuk',
    IMAGE_DIMENSIONS: 'Görsel boyutları uygun değil',
  },
  API: {
    RATE_LIMIT: 'Çok fazla istek gönderdiniz, lütfen bekleyin',
    SERVER_ERROR: 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
    NETWORK_ERROR: 'Ağ bağlantısı hatası',
    TIMEOUT: 'İstek zaman aşımına uğradı',
    INSUFFICIENT_CREDITS: 'Yetersiz kredi',
    CONCURRENT_REQUEST: 'Zaten devam eden bir deneme işleminiz var',
    SERVICE_UNAVAILABLE: 'Servis geçici olarak kullanılamıyor',
    BAD_GATEWAY: 'Ağ geçidi hatası',
  },
  FAL: {
    API_KEY_MISSING: 'FAL AI API anahtarı eksik',
    PROCESSING_FAILED: 'AI işleme başarısız oldu. Lütfen tekrar deneyin.',
    INVALID_RESPONSE: 'AI servisinden geçersiz yanıt alındı',
    QUOTA_EXCEEDED: 'API kotası aşıldı. Daha sonra tekrar deneyin veya kredi ekleyin.',
    RATE_LIMITED: 'AI servisine çok fazla istek gönderildi. Lütfen bekleyin.',
    MODEL_UNAVAILABLE: 'AI modeli şu anda kullanılamıyor',
    AUTH_FAILED: 'AI servisi kimlik doğrulaması başarısız',
    INSUFFICIENT_CREDITS: 'AI servisi için yeterli kredi yok',
    TIMEOUT: 'AI işlemi çok uzun sürdü',
    IMAGE_PROCESSING_FAILED: 'Görsel işleme başarısız oldu',
  },
  DATABASE: {
    CONNECTION_FAILED: 'Veritabanı bağlantısı başarısız',
    QUERY_FAILED: 'Veritabanı sorgusu başarısız',
    CONSTRAINT_VIOLATION: 'Veritabanı kısıtlaması ihlal edildi',
    TRANSACTION_FAILED: 'Veritabanı işlemi başarısız',
    LOCK_TIMEOUT: 'Veritabanı kilidi zaman aşımı',
  },
  FILE: {
    UPLOAD_FAILED: 'Dosya yükleme başarısız',
    PROCESSING_FAILED: 'Dosya işleme başarısız',
    STORAGE_FULL: 'Depolama alanı dolu',
    INVALID_TYPE: 'Geçersiz dosya türü',
    CORRUPTED: 'Dosya bozuk',
  },
} as const;

// TryOn Configuration
export const TRYON_CONFIG = {
  DEFAULT_GUIDANCE_SCALE: 7.5,
  DEFAULT_NUM_STEPS: 30,
  MIN_GUIDANCE_SCALE: 1.0,
  MAX_GUIDANCE_SCALE: 20.0,
  MIN_NUM_STEPS: 10,
  MAX_NUM_STEPS: 100,
  DEFAULT_SEED: null, // Random seed
  ENABLE_SAFETY_CHECKER: true,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  BATCH_SIZE: 1,
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'free',
    credits: 5,
    maxConcurrentJobs: 1,
    features: ['basic_tryon', 'image_results', 'history_7_days'],
  },
  PREMIUM: {
    name: 'premium',
    credits: 100,
    maxConcurrentJobs: 3,
    features: ['basic_tryon', 'video_results', 'priority_processing', 'history_30_days', 'multiple_formats'],
  },
  ENTERPRISE: {
    name: 'enterprise',
    credits: 1000,
    maxConcurrentJobs: 10,
    features: ['basic_tryon', 'video_results', 'priority_processing', 'unlimited_history', 'batch_processing', 'custom_models', 'api_access'],
  },
} as const;

// Database Table Names
export const TABLES = {
  PROFILES: 'profiles',
  TRYON_HISTORY: 'tryon_history',
  SUBSCRIPTIONS: 'subscriptions',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  GARMENTS: 'garments',
  API_LOGS: 'api_logs',
  ERROR_LOGS: 'error_logs',
  RATE_LIMITS: 'rate_limits',
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
  QUEUED: 'queued',
  TIMEOUT: 'timeout',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_CREDITS: (userId: string) => `user:${userId}:credits`,
  TRYON_HISTORY: (userId: string) => `user:${userId}:tryon-history`,
  API_RATE_LIMIT: (ip: string) => `rate-limit:${ip}`,
  FAL_RATE_LIMIT: (userId: string) => `fal-rate-limit:${userId}`,
  IMAGE_PROCESSING: (requestId: string) => `image-processing:${requestId}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
} as const;

// Cache TTLs (Time To Live in seconds)
export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  USER_CREDITS: 60, // 1 minute
  TRYON_HISTORY: 300, // 5 minutes
  API_RATE_LIMIT: 3600, // 1 hour
  FAL_RATE_LIMIT: 3600, // 1 hour
  IMAGE_PROCESSING: 600, // 10 minutes
  SESSION: 1800, // 30 minutes
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_VIDEO_GENERATION: true,
  ENABLE_MULTIPLE_GARMENTS: false,
  ENABLE_BATCH_PROCESSING: false,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_ADVANCED_OPTIONS: true,
  ENABLE_MODEL_TRAINING: false,
  ENABLE_COMMUNITY_SHARING: false,
  ENABLE_SOCIAL_FEATURES: false,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  TRYON_STARTED: 'tryon_started',
  TRYON_COMPLETED: 'tryon_completed',
  TRYON_FAILED: 'tryon_failed',
  CREDITS_PURCHASED: 'credits_purchased',
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_UPGRADED: 'user_upgraded',
  IMAGE_UPLOADED: 'image_uploaded',
  RESULT_DOWNLOADED: 'result_downloaded',
  SHARE_RESULT: 'share_result',
  ERROR_OCCURRED: 'error_occurred',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
} as const;

// Security Constants
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutes in seconds
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_DURATION: 604800, // 7 days in seconds
  REFRESH_TOKEN_DURATION: 2592000, // 30 days in seconds
  CSRF_TOKEN_LENGTH: 32,
  API_KEY_LENGTH: 64,
  ENCRYPTION_IV_LENGTH: 16,
} as const;

// Response Headers
export const RESPONSE_HEADERS = {
  REQUEST_ID: 'X-Request-ID',
  RESPONSE_TIME: 'X-Response-Time',
  RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  CREDITS_USED: 'X-Credits-Used',
  CREDITS_REMAINING: 'X-Credits-Remaining',
  PROCESSING_TIME: 'X-Processing-Time',
  CACHE_CONTROL: 'Cache-Control',
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
} as const;