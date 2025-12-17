// components/LogoutButton.tsx - GÜNCELLENMİŞ (daha görünür)
'use client';

import { useState } from 'react';
import { LogOut, Globe, ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Dil değiştirme butonu - DAHA BÜYÜK ve BELİRGİN */}
      <div className="relative">
        <button
          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-200"
        >
          <Globe className="w-5 h-5" />
          <span className="font-medium">
            {language === 'en' ? 'English' : 'Türkçe'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dil seçim menüsü */}
        {languageMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm text-gray-400">Select Language</span>
            </div>
            <button
              onClick={() => {
                setLanguage('en');
                setLanguageMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between ${
                language === 'en' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🇺🇸</span>
                <div className="flex flex-col">
                  <span className="font-medium">English</span>
                  <span className="text-xs text-gray-500">English</span>
                </div>
              </div>
              {language === 'en' && (
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              )}
            </button>
            <button
              onClick={() => {
                setLanguage('tr');
                setLanguageMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between ${
                language === 'tr' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🇹🇷</span>
                <div className="flex flex-col">
                  <span className="font-medium">Türkçe</span>
                  <span className="text-xs text-gray-500">Turkish</span>
                </div>
              </div>
              {language === 'tr' && (
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Çıkış butonu */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        <span className="font-medium">{t('buttons.logout')}</span>
      </button>
    </div>
  );
}