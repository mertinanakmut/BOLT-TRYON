// lib/validation.ts
import { z } from 'zod';
import { STORAGE, GARMENT_CATEGORIES, TRYON_CONFIG, FAL_AI } from './constants';

// Helper function to validate base64 image size
function validateBase64Size(base64: string): boolean {
  try {
    // Remove data URL prefix if exists
    let cleanBase64 = base64;
    if (base64.startsWith('data:image/')) {
      const commaIndex = base64.indexOf(',');
      if (commaIndex === -1) return false;
      cleanBase64 = base64.substring(commaIndex + 1);
    }
    
    // Remove whitespace
    cleanBase64 = cleanBase64.replace(/\s/g, '');
    
    // Validate base64 format
    if (!/^[A-Za-z0-9+/]+=*$/.test(cleanBase64)) {
      return false;
    }
    
    // Calculate approximate file size
    // Base64 uses 4 characters for every 3 bytes
    const padding = (cleanBase64.match(/=/g) || []).length;
    const fileSize = (cleanBase64.length * 3) / 4 - padding;
    
    return fileSize <= STORAGE.MAX_FILE_SIZE;
  } catch {
    return false;
  }
}

// Base64 image validation with improved checks
const base64ImageSchema = z.string()
  .min(100, 'Görsel çok kısa veya geçersiz')
  .max(10 * 1024 * 1024, `Görsel boyutu ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB'dan küçük olmalı`) // Rough character limit
  .refine((val) => {
    // Check if it's a data URL
    if (val.startsWith('data:image/')) {
      const [header, data] = val.split(',');
      if (!header || !data) return false;
      
      // Check MIME type
      const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9.+]+);base64/);
      if (!mimeMatch) return false;
      
      const mimeType = mimeMatch[1];
      if (!FAL_AI.SUPPORTED_FORMATS.includes(mimeType as any)) {
        return false;
      }
      
      // Validate base64 data
      return validateBase64Size(val);
    }
    
    // Pure base64 - validate format and size
    return validateBase64Size(val);
  }, {
    message: `Geçerli bir JPEG, PNG veya WebP görseli yükleyin. Maksimum boyut: ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB`,
  })
  .refine((val) => {
    // Additional check for minimum image dimensions (approximate)
    try {
      let cleanBase64 = val;
      if (val.startsWith('data:image/')) {
        const commaIndex = val.indexOf(',');
        cleanBase64 = val.substring(commaIndex + 1);
      }
      
      // Very basic check - just ensure it's not empty
      return cleanBase64.length > 100;
    } catch {
      return false;
    }
  }, {
    message: 'Görsel çok küçük veya geçersiz',
  });

// Try-on request schema with Fal AI specific options
export const tryOnSchema = z.object({
  modelImage: base64ImageSchema,
  tshirtImage: base64ImageSchema,
  generateVideo: z.boolean().default(false),
  options: z.object({
    category: z.enum(GARMENT_CATEGORIES).default('tshirt'),
    style: z.string().max(50).optional(),
    seed: z.number().int().min(0).max(1000000).optional(),
    garmentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    // Fal AI specific options
    modelName: z.enum([FAL_AI.MODELS.FACE_TO_MANY, FAL_AI.MODELS.CLOTHING_TRYON, FAL_AI.MODELS.OUTFIT_ANYONE])
      .default(FAL_AI.DEFAULT_MODEL),
    guidanceScale: z.number()
      .min(TRYON_CONFIG.MIN_GUIDANCE_SCALE)
      .max(TRYON_CONFIG.MAX_GUIDANCE_SCALE)
      .default(TRYON_CONFIG.DEFAULT_GUIDANCE_SCALE),
    numInferenceSteps: z.number()
      .min(TRYON_CONFIG.MIN_NUM_STEPS)
      .max(TRYON_CONFIG.MAX_NUM_STEPS)
      .default(TRYON_CONFIG.DEFAULT_NUM_STEPS),
    enableSafetyChecker: z.boolean().default(TRYON_CONFIG.ENABLE_SAFETY_CHECKER),
    syncMode: z.boolean().default(true),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
  }).optional().default({}),
}).superRefine((data, ctx) => {
  // Additional cross-field validation
  if (data.generateVideo && data.options?.modelName !== FAL_AI.MODELS.FACE_TO_MANY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Video generation is currently only supported with face-to-many model',
      path: ['generateVideo'],
    });
  }
  
  // Ensure images are not the same (basic check)
  if (data.modelImage === data.tshirtImage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Model and garment images cannot be the same',
      path: ['tshirtImage'],
    });
  }
});

// Auth schemas
export const emailSchema = z.string()
  .min(1, 'Email zorunludur')
  .email('Geçerli bir email adresi girin')
  .max(255, 'Email çok uzun')
  .toLowerCase()
  .trim();

export const passwordSchema = z.string()
  .min(6, 'Şifre en az 6 karakter olmalı')
  .max(128, 'Şifre çok uzun')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermeli')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermeli');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().default(false),
});

export const registerSchema = loginSchema.extend({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(100, 'İsim çok uzun')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf içerebilir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string().min(1, 'Token zorunludur'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Credit operation schema
export const creditOperationSchema = z.object({
  amount: z.number()
    .int('Tam sayı olmalı')
    .positive('Pozitif bir tam sayı girin')
    .max(1000, 'Maksimum 1000 kredi ekleyebilirsiniz'),
  operation: z.enum(['add', 'subtract', 'reset']),
  reason: z.string().max(200).optional(),
  transactionId: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional(),
});

// Image upload schema
export const imageUploadSchema = z.object({
  image: base64ImageSchema,
  type: z.enum(['model', 'garment']),
  name: z.string().max(100).optional(),
  category: z.enum(GARMENT_CATEGORIES).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublic: z.boolean().default(false),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(100, 'İsim çok uzun')
    .optional(),
  avatar: base64ImageSchema.optional(),
  language: z.enum(['tr', 'en']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    autoSave: z.boolean().optional(),
    highQuality: z.boolean().optional(),
  }).optional(),
});

// API Key generation schema
export const apiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['read', 'write', 'delete'])).min(1),
  expiresAt: z.string().datetime().optional(),
});

// Rate limiting schema
export const rateLimitSchema = z.object({
  endpoint: z.string().min(1),
  limit: z.number().int().positive(),
  window: z.number().int().positive(), // in seconds
  userId: z.string().uuid().optional(),
  ip: z.string().ip().optional(),
});

// Error logging schema
export const errorLogSchema = z.object({
  errorCode: z.string().min(1),
  errorMessage: z.string().min(1),
  stackTrace: z.string().optional(),
  userId: z.string().uuid().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  endpoint: z.string().optional(),
  requestBody: z.any().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

// Analytics event schema
export const analyticsEventSchema = z.object({
  eventName: z.string().min(1),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

// Type exports
export type TryOnInput = z.infer<typeof tryOnSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreditOperationInput = z.infer<typeof creditOperationSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type RateLimitInput = z.infer<typeof rateLimitSchema>;
export type ErrorLogInput = z.infer<typeof errorLogSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

// Helper functions
export function validateBase64Image(base64: string): {
  isValid: boolean;
  error?: string;
  size?: number;
  mimeType?: string;
} {
  try {
    const result = base64ImageSchema.safeParse(base64);
    
    if (!result.success) {
      return {
        isValid: false,
        error: result.error.errors[0]?.message || 'Geçersiz görsel formatı',
      };
    }
    
    // Calculate actual size
    let cleanBase64 = base64;
    if (base64.startsWith('data:image/')) {
      const commaIndex = base64.indexOf(',');
      cleanBase64 = base64.substring(commaIndex + 1);
    }
    
    cleanBase64 = cleanBase64.replace(/\s/g, '');
    const padding = (cleanBase64.match(/=/g) || []).length;
    const fileSize = (cleanBase64.length * 3) / 4 - padding;
    
    // Extract MIME type
    let mimeType = 'unknown';
    if (base64.startsWith('data:image/')) {
      const mimeMatch = base64.match(/data:(image\/[a-zA-Z0-9.+]+);base64/);
      mimeType = mimeMatch?.[1] || 'unknown';
    }
    
    return {
      isValid: true,
      size: fileSize,
      mimeType,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Görsel doğrulama sırasında hata oluştu',
    };
  }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .trim();
}

export function validateImageDimensions(
  base64: string,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): boolean {
  // Note: This is a simplified check. For accurate dimensions,
  // you would need to decode the image or use a library like sharp.
  // This just ensures the image is not obviously too small.
  try {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binary = atob(base64Data);
    return binary.length > 1024; // At least 1KB
  } catch {
    return false;
  }
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

// Fal AI specific validations
export function validateFalPayload(payload: TryOnInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check model image
  const modelValidation = validateBase64Image(payload.modelImage);
  if (!modelValidation.isValid) {
    errors.push(`Model image: ${modelValidation.error}`);
  }
  
  // Check garment image
  const garmentValidation = validateBase64Image(payload.tshirtImage);
  if (!garmentValidation.isValid) {
    errors.push(`Garment image: ${garmentValidation.error}`);
  }
  
  // Check if both images are valid
  if (modelValidation.isValid && garmentValidation.isValid) {
    // Ensure images are not too similar in size (basic check)
    const sizeDiff = Math.abs((modelValidation.size || 0) - (garmentValidation.size || 0));
    const avgSize = ((modelValidation.size || 0) + (garmentValidation.size || 0)) / 2;
    
    if (sizeDiff > avgSize * 0.9) {
      errors.push('Image sizes differ too much. Please use images with similar dimensions.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}