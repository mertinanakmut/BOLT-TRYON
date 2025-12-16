// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TryOnClient } from '@/components/TryOnClient';
import { HistoryGrid } from '@/components/HistoryGrid';
import { CompareView } from '@/components/CompareView';
import { Card } from '@/components/Card';
import { LogoutButton } from '@/components/LogoutButton';
import { Spinner } from '@/components/Spinner';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(5); // Default credits
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'compare'>('generate');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // Fetch user credits
        const { data } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setCredits(data.credits || 5);
        }
      } else {
        window.location.href = '/auth/login';
        return;
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          window.location.href = '/auth/login';
        }
        if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white">Loading your studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      // app/page.tsx - SADECE HEADER KISMI GÜNCELLENİYOR
<header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
    <div className="flex items-center justify-between">
      {/* Sol taraf */}
      <div className="flex items-center space-x-4 sm:space-x-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Virtual Try-On Studio</h1>
          <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Powered by Fal AI</p>
        </div>
        
        <nav className="hidden md:flex space-x-4">
          {/* ... tab butonları aynı ... */}
        </nav>
      </div>

      {/* Sağ taraf - LOGOUT BUTONU BURADA */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Kredi bilgisi - MOBİL'DE GİZLİ */}
        <div className="hidden sm:block">
          <Card className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">⭐</span>
              <span className="font-bold text-sm">{credits}</span>
              <span className="text-xs opacity-90">credits</span>
            </div>
          </Card>
        </div>
        
        {/* Email bilgisi - MOBİL'DE GİZLİ */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-gray-400 truncate max-w-[150px]">Logged in as</p>
          <p className="text-sm font-medium truncate max-w-[150px]">{user.email}</p>
        </div>
        
        {/* LOGOUT BUTONU - HER ZAMAN GÖRÜNÜR */}
        <LogoutButton />
      </div>
    </div>

    {/* Mobile Navigation */}
    <div className="md:hidden flex justify-between items-center mt-3">
      <div className="flex space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap flex-1 min-w-[80px] text-center ${
            activeTab === 'generate'
              ? 'bg-white text-black'
              : 'bg-white/10'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap flex-1 min-w-[80px] text-center ${
            activeTab === 'history'
              ? 'bg-white text-black'
              : 'bg-white/10'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap flex-1 min-w-[80px] text-center ${
            activeTab === 'compare'
              ? 'bg-white text-black'
              : 'bg-white/10'
          }`}
        >
          Compare
        </button>
      </div>
      
      {/* Mobile Kredi Göstergesi */}
      <div className="ml-2 sm:hidden">
        <div className="flex items-center px-2 py-1 bg-purple-500/20 rounded">
          <span className="text-xs mr-1">⭐</span>
          <span className="font-bold text-xs">{credits}</span>
        </div>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Content */}
          {activeTab === 'generate' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">Create New Try-On</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Upload a model photo and a garment image to generate a virtual try-on.
                  Each generation uses 1 credit.
                </p>
              </div>
              
              <TryOnClient />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">Generation History</h2>
                <p className="text-gray-400">
                  View your previous virtual try-on generations
                </p>
              </div>
              
              <HistoryGrid userId={user.id} />
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">Compare Results</h2>
                <p className="text-gray-400">
                  Compare different try-on results side by side
                </p>
              </div>
              
              <CompareView userId={user.id} />
            </div>
          )}

          {/* Credits Info & Upgrade */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need more credits?</h3>
                <p className="text-gray-400">
                  Upgrade your plan for unlimited generations
                </p>
              </div>
              
              <a
                href="/upgrade"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                         rounded-lg font-semibold hover:opacity-90 transition-opacity
                         inline-flex items-center space-x-2"
              >
                <span>⚡</span>
                <span>Upgrade Plan</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Virtual Try-On Studio • Powered by Fal AI • Made with Next.js & Supabase</p>
          <p className="mt-2">
            Need help? Contact support@example.com
          </p>
        </div>
      </footer>
    </div>
  );
}