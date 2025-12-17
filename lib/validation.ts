// lib/validation.ts - GÜNCELLENMİŞ
import { z } from 'zod';

// Base64 image validation
const base64ImageSchema = z.string().refine((val) => {
  if (val.startsWith('data:image/')) {
    return true;
  }
  try {
    // Basic base64 validation
    return btoa(atob(val)) === val;
  } catch {
    return false;
  }
}, {
  message: 'Must be a valid Base64 image'
});

// Try-on schema (mevcut API'ye göre)
export const tryOnSchema = z.object({
  modelImage: base64ImageSchema,
  tshirtImage: base64ImageSchema,
  generateVideo: z.boolean().default(false),
});

// Type export
export type TryOnInput = z.infer<typeof tryOnSchema>;