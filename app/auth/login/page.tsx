'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('mert.akmut44@gmail.com'); // Test için
  const [password, setPassword] = useState(''); // Şifreyi kendin gir
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde mevcut session'ı kontrol et
  useEffect(() => {
    const checkExistingSession = async () => {
      console.log('🔍 Checking existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('🔴 Session check error:', error);
        return;
      }
      
      console.log('🟡 Existing session:', session ? 'YES' : 'NO');
      if (session) {
        console.log('🟢 User already logged in:', session.user.email);
        router.push('/');
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('🚀 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    try {
      // Email'i temizle (küçük harf ve trim)
      const cleanEmail = email.trim().toLowerCase();
      
      console.log('🔄 Calling supabase.auth.signInWithPassword...');
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      console.log('📥 Login response received');
      console.log('Data:', data);
      console.log('Error:', signInError);

      if (signInError) {
        console.error('❌ Login failed:', signInError);
        
        // Hata mesajını daha kullanıcı dostu yap
        let errorMessage = signInError.message;
        
        if (signInError.message.includes('Invalid login credentials')) {
          errorMessage = 'Email veya şifre yanlış. Lütfen kontrol edin.';
        } else if (signInError.message.includes('Email not confirmed')) {
          errorMessage = 'Email adresinizi doğrulamadınız. Lütfen emailinizi kontrol edin.';
        } else if (signInError.message.includes('too many requests')) {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (!data?.session) {
        console.error('❌ No session in response');
        setError('Giriş yapılamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      console.log('✅ Login successful!');
      console.log('👤 User:', data.user?.email);
      console.log('🔐 Session expires at:', data.session.expires_at);

      // Session'ı tekrar kontrol et
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔄 Current session after login:', sessionData.session ? 'EXISTS' : 'MISSING');

      if (sessionData.session) {
        console.log('🎉 Session successfully stored');
        
        // Kısa bir bekleme ve yönlendirme
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 500);
      } else {
        console.error('❌ Session not persisted!');
        setError('Oturum kaydedilemedi. Lütken tarayıcı ayarlarınızı kontrol edin.');
        setLoading(false);
      }

    } catch (err: any) {
      console.error('💥 Unexpected error:', err);
      setError('Beklenmeyen bir hata oluştu: ' + (err.message || 'Lütfen tekrar deneyin.'));
      setLoading(false);
    }
  };

  const checkCurrentSession = async () => {
    console.log('🔍 Manually checking session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      alert('Session check error: ' + error.message);
      return;
    }
    
    if (session) {
      console.log('✅ Session found!');
      console.log('User:', session.user);
      console.log('Expires:', new Date(session.expires_at! * 1000));
      alert(`Logged in as: ${session.user.email}\nExpires: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
    } else {
      console.log('❌ No session found');
      alert('No active session found');
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    console.log('🧹 LocalStorage cleared');
    alert('LocalStorage temizlendi! Sayfayı yenileyin.');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/auth/register" className="text-primary hover:underline">
          Create account
        </Link>
      </div>

      {/* DEBUG PANEL */}
      <div className="mt-8 border-t pt-4">
        <p className="text-sm text-muted-foreground mb-2">Debug Tools:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkCurrentSession}
            className="text-xs"
          >
            Check Session
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Environment Check:', {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
              });
              alert(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...\nKey exists: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
            }}
            className="text-xs"
          >
            Check Env Vars
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearStorage}
            className="text-xs"
          >
            Clear Storage
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const cookies = document.cookie;
              console.log('Cookies:', cookies);
              alert(`Cookies:\n${cookies || 'No cookies found'}`);
            }}
            className="text-xs"
          >
            Check Cookies
          </Button>
        </div>
      </div>
    </div>
  );
}