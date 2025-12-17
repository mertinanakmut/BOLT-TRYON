// lib/validation.ts
import { z } from 'zod';
import { STORAGE, GARMENT_CATEGORIES } from './constants';

// Base64 image validation
const base64ImageSchema = z.string()
  .min(10, 'Görsel çok kısa')
  .refine((val) => {
    // Data URL format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
    if (val.startsWith('data:image/')) {
      const [header, data] = val.split(',');
      if (!header || !data) return false;
      
      // Check MIME type
      const mimeMatch = header.match(/data:(image\/\w+);base64/);
      if (!mimeMatch) return false;
      
      const mimeType = mimeMatch[1];
      if (!STORAGE.ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
        return false;
      }
      
      // Check base64 data length
      const base64Length = data.length;
      const fileSize = (base64Length * 3) / 4;
      return fileSize <= STORAGE.MAX_FILE_SIZE;
    }
    
    // Pure base64
    try {
      const clean = val.replace(/\s/g, '');
      if (!/^[A-Za-z0-9+/]+=*$/.test(clean)) return false;
      
      const binary = atob(clean);
      return binary.length <= STORAGE.MAX_FILE_SIZE;
    } catch {
      return false;
    }
  }, {
    message: `Geçerli bir Base64 görsel girin. Maksimum boyut: ${STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB`,
  });

// Try-on request schema
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
  }).optional(),
});

// Auth schemas
export const emailSchema = z.string().email('Geçerli bir email adresi girin');
export const passwordSchema = z.string().min(6, 'Şifre en az 6 karakter olmalı');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Credit operation schema
export const creditOperationSchema = z.object({
  amount: z.number().int().positive('Pozitif bir tam sayı girin').max(1000),
  operation: z.enum(['add', 'subtract', 'reset']),
  reason: z.string().max(200).optional(),
  transactionId: z.string().optional(),
});

// Image upload schema
export const imageUploadSchema = z.object({
  image: base64ImageSchema,
  type: z.enum(['model', 'garment']),
  name: z.string().max(100).optional(),
  category: z.enum(GARMENT_CATEGORIES).optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: base64ImageSchema.optional(),
  language: z.enum(['tr', 'en']).optional(),
  notifications: z.boolean().optional(),
});

// Type exports
export type TryOnInput = z.infer<typeof tryOnSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreditOperationInput = z.infer<typeof creditOperationSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Helper functions
export function validateBase64Image(base64: string): boolean {
  try {
    return base64ImageSchema.safeParse(base64).success;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}