export const runtime = 'nodejs';
// middleware.ts - GÜNCELLENMİŞ VERSİYON
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Basit memory rate limiter (production için Upstash Redis kullanacağız)
class SimpleRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  isLimited(ip: string, limit: number = 10, windowMs: number = 10000): boolean {
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record) {
      this.requests.set(ip, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return false;
    }

    if (record.count >= limit) {
      return true;
    }

    record.count++;
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

const rateLimiter = new SimpleRateLimiter();

// Her 5 dakikada bir temizlik yap
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // 1. API Rate Limiting
  if (pathname.startsWith('/api/')) {
    // Auth endpoint'leri için daha yüksek limit
    const isAuthEndpoint = pathname.includes('/api/auth/');
    const limit = isAuthEndpoint ? 5 : 10; // Auth için daha düşük limit
    
    if (rateLimiter.isLimited(ip, limit)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Çok fazla istek gönderdiniz. Lütfen 10 saniye bekleyin.',
          code: 'RATE_LIMITED'
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Reset': '10',
          }
        }
      );
    }

    // Sensitive API'ler için ek kontroller
    if (pathname.startsWith('/api/tryon') || pathname.startsWith('/api/credits')) {
      // Bu endpoint'ler sadece authenticated kullanıcılar için
      // Auth kontrolü endpoint içinde yapılacak
    }
  }

  // 2. Path Traversal/Injection koruması
  const maliciousPatterns = [
    /\.\.\//, // Directory traversal
    /\/\/\//, // Multiple slashes
    /[<>]/,   // HTML injection
    /eval\(/i, // eval injection
    /union.*select/i, // SQL injection pattern
  ];

  const urlPath = request.nextUrl.pathname + request.nextUrl.search;
  for (const pattern of maliciousPatterns) {
    if (pattern.test(urlPath)) {
      console.warn(`Potentially malicious request blocked: ${urlPath} from IP: ${ip}`);
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  // 3. Session güncelleme
  try {
    const response = await updateSession(request);
    
    // 4. Security Headers ekle
    const securityHeaders = {
      'X-DNS-Prefetch-Control': 'off',
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };

    // Development'da debug headers
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Debug-IP', ip);
      response.headers.set('X-Debug-Path', pathname);
    }

    // Security headers ekle
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // 5. CORS Headers (API endpoint'leri için)
    if (pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
          ? '*' 
          : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      };

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Preflight request handling
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: corsHeaders,
        });
      }
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Hata durumunda basic response
    const errorResponse = NextResponse.next();
    errorResponse.headers.set('X-Error', 'Middleware failed');
    
    return errorResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - image files
     * - api/auth/callback (Supabase auth callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};