// lib/constants.ts
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const APP = {
  NAME: 'TryOn AI',
  VERSION: '1.0.0',
} as const;

export const CREDITS = {
  DEFAULT_FREE_CREDITS: 5,
  TRYON_COST: 1,
  TRYON_VIDEO_COST: 2,
} as const;

// ✅ STATUS ekledik
export const STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERRORS = {
  AUTH: {
    UNAUTHORIZED: 'Bu işlem için giriş yapmalısınız',
  },
  API: {
    SERVER_ERROR: 'Sunucu hatası',
    INSUFFICIENT_CREDITS: 'Yetersiz kredi',
  },
} as const;