export const runtime = 'nodejs';

// middleware.ts - BASİT VE GÜVENLİ VERSİYON
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Environment değişkenlerini doğrudan al
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
const nodeEnv = process.env['NODE_ENV'] || 'development';
const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000';

// Geliştirme modunda kontrol
if (nodeEnv === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables might be missing');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  }
}

// Basit memory rate limiter
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
}

const rateLimiter = new SimpleRateLimiter();

// Session güncelleme fonksiyonu
async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    await supabase.auth.getUser();
    return response;
  } catch (error) {
    console.error('Supabase session update failed:', error);
    return response; // Hata durumunda da response'u döndür
  }
}

// Ana middleware fonksiyonu
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // 1. Static dosyalar için middleware'i bypass et
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. API Rate Limiting (sadece kritik endpoint'ler için)
  if (pathname.startsWith('/api/tryon') || pathname.startsWith('/api/credits')) {
    if (rateLimiter.isLimited(ip, 5, 10000)) { // 5 istek / 10 saniye
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Çok fazla istek gönderdiniz. Lütfen 10 saniye bekleyin.',
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // 3. Temel güvenlik kontrolleri
  const urlPath = request.nextUrl.pathname + request.nextUrl.search;
  
  // Directory traversal koruması
  if (urlPath.includes('..') || urlPath.includes('//')) {
    console.warn(`Potentially malicious path blocked: ${urlPath}`);
    return new NextResponse('Bad Request', { status: 400 });
  }

  try {
    // 4. Session güncelleme
    const response = await updateSession(request);
    
    // 5. Temel Security Headers ekle
    const securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    // Security headers ekle
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // 6. CORS Headers (API endpoint'leri için)
    if (pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': nodeEnv === 'development' 
          ? '*' 
          : siteUrl,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    // 7. Auth koruması - sadece giriş yapmamış kullanıcıları login'e yönlendir
    if (!pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
      // Auth kontrolü client-side'da yapılacak
      // Burada sadece temel yönlendirme yapıyoruz
      if (pathname === '/') {
        const url = new URL('/', request.url);
        return NextResponse.rewrite(url);
      }
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Hata durumunda basic response
    return NextResponse.next();
  }
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    /*
     * Tüm request path'leri eşleştir, şunlar hariç:
     * - _next/static (static dosyalar)
     * - _next/image (image optimization dosyaları)
     * - favicon.ico
     * - public/ klasörü
     * - image ve asset dosyaları
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};