import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Supabase auth cookie'leri
  const accessToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value ||
    request.cookies.get('sb:token')?.value;

  // Giriş yoksa login'e yönlendir
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Giriş varsa devam
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Korunacak sayfalar
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
