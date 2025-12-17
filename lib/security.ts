// lib/security.ts
import { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/\.\.\//g, '') // Prevent directory traversal
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, 1000); // Limit length
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'supabase.co',
      'fal.media',
      'localhost',
    ];
    
    return allowedDomains.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}