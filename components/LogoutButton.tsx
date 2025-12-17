// components/LogoutButton.tsx - DÜZENLENMİŞ
'use client';

import { useState } from 'react';
import { LogOut, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useLanguage } from '@/contexts/LanguageContext';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

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

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'tr' : 'en';
    setLanguage(newLang);
    setShowLanguageMenu(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Dil Değiştirme Butonu */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          title={language === 'en' ? 'Switch to Turkish' : 'Türkçeye geç'}
        >
          <Globe className="w-5 h-5" />
          <span className="text-sm font-medium">
            {language.toUpperCase()}
          </span>
        </button>
        
        {/* Dil Seçim Menüsü */}
        {showLanguageMenu && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                setLanguage('en');
                setShowLanguageMenu(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center justify-between ${
                language === 'en' ? 'bg-gray-800' : ''
              }`}
            >
              <span>English</span>
              {language === 'en' && (
                <span className="text-green-400">✓</span>
              )}
            </button>
            <button
              onClick={() => {
                setLanguage('tr');
                setShowLanguageMenu(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center justify-between ${
                language === 'tr' ? 'bg-gray-800' : ''
              }`}
            >
              <span>Türkçe</span>
              {language === 'tr' && (
                <span className="text-green-400">✓</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Çıkış Butonu */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{t('buttons.logout')}</span>
      </button>
    </div>
  );
}