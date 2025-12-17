// app/page.tsx - TAMAMEN DÜZELTİLMİŞ
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
  const [credits, setCredits] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'compare'>('generate');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* FIXED HEADER - DÜZELTİLDİ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* ÜST SATIR: Logo + Kullanıcı Bilgisi */}
          <div className="flex items-center justify-between py-3">
            {/* SOL: Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="font-bold text-sm">V</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Try-On Studio</h1>
                <p className="text-xs text-gray-400 hidden sm:inline">AI Powered</p>
              </div>
            </div>

            {/* SAĞ: Kullanıcı + Logout */}
            <div className="flex items-center space-x-3">
              {/* Kredi - MOBİL'DE KÜÇÜK */}
              <div className="hidden sm:block">
                <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-white/10">
                  <span className="text-yellow-400 mr-1.5">⭐</span>
                  <span className="font-bold">{credits}</span>
                  <span className="text-xs text-gray-300 ml-1">credits</span>
                </div>
              </div>
              
              {/* MOBİL Kredi (küçük) */}
              <div className="sm:hidden">
                <div className="flex items-center px-2 py-1 bg-purple-500/20 rounded">
                  <span className="text-xs mr-1">⭐</span>
                  <span className="font-bold text-sm">{credits}</span>
                </div>
              </div>
              
              {/* Logout Butonu */}
              <LogoutButton />
            </div>
          </div>

          {/* ALT SATIR: Navigation Tabs */}
          <div className="border-t border-white/10 pt-3 pb-3">
            <div className="flex justify-between items-center">
              {/* Navigation Tabs */}
              <nav className="flex space-x-1 w-full">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'generate'
                      ? 'bg-white text-black shadow-lg'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">🎨 Generate</span>
                  <span className="sm:hidden">🎨</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-white text-black shadow-lg'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">📚 History</span>
                  <span className="sm:hidden">📚</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'compare'
                      ? 'bg-white text-black shadow-lg'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">⚖️ Compare</span>
                  <span className="sm:hidden">⚖️</span>
                </button>
              </nav>
              
              {/* Email - SADECE DESKTOP */}
              <div className="hidden lg:block ml-6 text-right min-w-[180px]">
                <p className="text-xs text-gray-400 truncate">Logged in as</p>
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Header yüksekliğine göre padding */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Başlıkları */}
          <div className="mb-8 text-center">
            {activeTab === 'generate' && (
              <>
                <h2 className="text-3xl font-bold mb-3">Create New Try-On</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Upload a model photo and a garment image to generate a virtual try-on.
                  Each generation uses 1 credit.
                </p>
              </>
            )}
            
            {activeTab === 'history' && (
              <>
                <h2 className="text-3xl font-bold mb-3">Generation History</h2>
                <p className="text-gray-400">
                  View your previous virtual try-on generations
                </p>
              </>
            )}
            
            {activeTab === 'compare' && (
              <>
                <h2 className="text-3xl font-bold mb-3">Compare Results</h2>
                <p className="text-gray-400">
                  Compare different try-on results side by side
                </p>
              </>
            )}
          </div>

          {/* Tab İçerikleri */}
          <div className="min-h-[500px]">
            {activeTab === 'generate' && <TryOnClient />}
            {activeTab === 'history' && <HistoryGrid userId={user.id} />}
            {activeTab === 'compare' && <CompareView userId={user.id} />}
          </div>

          {/* Upgrade Banner */}
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