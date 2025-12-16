// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false); // Yeni: Kontrol edildi mi?

  useEffect(() => {
    // Session kontrolü sadece bir kere yap
    if (hasChecked) return;

    const checkUser = async () => {
      console.log('🏠 HomePage: Checking for user session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ HomePage: Session check error:', error);
        setIsLoading(false);
        setHasChecked(true);
        return;
      }

      console.log('📋 HomePage: Session found:', !!session);

      if (session?.user) {
        console.log('✅ HomePage: User logged in:', session.user.email);
        setUserEmail(session.user.email);
      } else {
        console.log('❌ HomePage: No session. Redirecting to login...');
        // Tek seferlik yönlendirme
        setHasChecked(true);
        router.push('/auth/login');
        return; // Buradan çık, daha fazla render etme
      }
      
      setIsLoading(false);
      setHasChecked(true);
    };

    checkUser();
  }, [router, hasChecked]); // hasChecked dependency eklendi

  // Auth state değişikliklerini dinle (sadece giriş/çıkış için)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 HomePage: Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setUserEmail(session.user?.email || null);
          setIsLoading(false);
        }
        
        if (event === 'SIGNED_OUT') {
          setUserEmail(null);
          router.push('/auth/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Eğer yönlendirildiyse, boş bir div döndür
  if (!userEmail && hasChecked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Home Page</h1>
          
          {userEmail ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-green-400">✅</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Successfully logged in!
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Email: <strong className="font-semibold">{userEmail}</strong>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Welcome to your dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                  This is your main application page. You can add your content here.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      // Hard redirect yap (router.push döngüye sebep olabilir)
                      window.location.href = '/auth/login';
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                  
                  <button
                    onClick={() => {
                      // Başka bir işlem
                      console.log('Additional action');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Another Action
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">
                  Not authenticated. Redirecting to login page...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}