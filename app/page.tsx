// app/page.tsx - PROFESYONEL TASARIM
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TryOnClient } from '@/components/TryOnClient';
import { HistoryGrid } from '@/components/HistoryGrid';
import { CompareView } from '@/components/CompareView';
import { Card } from '@/components/Card';
import { LogoutButton } from '@/components/LogoutButton';
import { Spinner } from '@/components/Spinner';
import { Palette, History, GitCompare, Zap, User, Sparkles } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">Loading your studio...</p>
          <p className="mt-2 text-gray-400">Preparing your creative space</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* SIDE NAVIGATION - YENİ TASARIM */}
      <div className="fixed left-0 top-0 bottom-0 w-20 lg:w-64 z-40">
        <div className="h-full flex flex-col bg-gray-900/90 backdrop-blur-xl border-r border-gray-800">
          
          {/* Logo Alanı */}
          <div className="p-4 lg:p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="font-bold text-lg">Try-On AI</h1>
                <p className="text-xs text-gray-400">Studio</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - DİKEY */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('generate')}
              className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30 shadow-lg'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'generate' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gray-800'
              }`}>
                <Palette className="w-5 h-5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-medium">Generate</p>
                <p className="text-xs text-gray-400">Create new try-ons</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30 shadow-lg'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'history' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gray-800'
              }`}>
                <History className="w-5 h-5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-medium">History</p>
                <p className="text-xs text-gray-400">View past creations</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 ${
                activeTab === 'compare'
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 border border-purple-500/30 shadow-lg'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                activeTab === 'compare' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gray-800'
              }`}>
                <GitCompare className="w-5 h-5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-medium">Compare</p>
                <p className="text-xs text-gray-400">Side-by-side view</p>
              </div>
            </button>
          </nav>

          {/* User & Credits - ALT KISIM */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium truncate max-w-[140px]">{user.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">Pro Member</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-bold">{credits}</p>
                  <p className="text-xs text-gray-400">credits</p>
                </div>
                <div className="lg:hidden font-bold">{credits}</div>
              </div>
            </div>
            
            {/* Logout Butonu */}
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Sidebar'dan sonra */}
      <div className="ml-20 lg:ml-64 min-h-screen">
        {/* TOP BAR - Sadece mobile için */}
        <div className="lg:hidden sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500"></div>
              <div>
                <h1 className="font-bold">Try-On AI</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center px-2 py-1 bg-yellow-500/20 rounded">
                    <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs font-bold">{credits}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-xs text-gray-400">Hi, {user.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header - Tab'a göre değişen */}
            <div className="mb-8 lg:mb-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                    {activeTab === 'generate' && 'Create New Try-On'}
                    {activeTab === 'history' && 'Generation History'}
                    {activeTab === 'compare' && 'Compare Results'}
                  </h1>
                  <p className="text-gray-300 text-lg max-w-3xl">
                    {activeTab === 'generate' && 'Upload a model photo and garment image to generate AI-powered virtual try-ons. Each generation uses 1 credit.'}
                    {activeTab === 'history' && 'Browse your previous try-on generations, download results, or delete old creations.'}
                    {activeTab === 'compare' && 'Select multiple generations to compare them side-by-side for better decision making.'}
                  </p>
                </div>
                
                {/* Stats & Info Cards */}
                <div className="flex flex-wrap gap-4">
                  <Card className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Available Credits</p>
                        <p className="text-2xl font-bold">{credits}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <a 
                    href="/upgrade" 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 self-center"
                  >
                    <span>⚡</span>
                    <span>Upgrade</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 lg:p-8 shadow-2xl">
              {activeTab === 'generate' && <TryOnClient />}
              {activeTab === 'history' && <HistoryGrid userId={user.id} />}
              {activeTab === 'compare' && <CompareView userId={user.id} />}
            </div>

            {/* Bottom Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-black border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Fast Generation</h3>
                    <p className="text-sm text-gray-400">
                      Get results in under 30 seconds with our optimized AI models
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-black border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">High Quality</h3>
                    <p className="text-sm text-gray-400">
                      4K resolution output with realistic lighting and textures
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-black border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Privacy First</h3>
                    <p className="text-sm text-gray-400">
                      Your images are processed securely and deleted after 24 hours
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-800 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} Try-On AI Studio. All rights reserved.
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Powered by Fal AI • Built with Next.js & Supabase
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a>
                <a href="mailto:support@tryon.ai" className="text-gray-400 hover:text-white text-sm">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}