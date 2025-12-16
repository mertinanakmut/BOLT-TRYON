// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      console.log('🏠 HomePage: Checking for user session...');
      setIsLoading(true);
      
      // 1. Mevcut oturumu al
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ HomePage: Session check error:', error);
        setIsLoading(false);
        return;
      }

      console.log('📋 HomePage: Raw session data:', session);

      if (session && session.user) {
        console.log('✅ HomePage: User IS logged in:', session.user.email);
        setUserEmail(session.user.email);
      } else {
        console.log('❌ HomePage: NO valid session found. Redirecting to login...');
        // Eğer oturum yoksa, login sayfasına yönlendir
        router.push('/auth/login');
      }
      setIsLoading(false);
    };

    checkUser();

    // 2. Auth state değişikliklerini dinle (giriş/çıkış için)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 HomePage: Auth state changed:', event, session?.user?.email);
        if (session) {
          setUserEmail(session.user?.email || null);
        } else {
          setUserEmail(null);
          router.push('/auth/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return <div className="p-8">Loading user session...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Home Page</h1>
      {userEmail ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">🎉 Success!</p>
          <p>You are logged in as: <strong>{userEmail}</strong></p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Not logged in. Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
}