// app/layout.tsx - DİL SEÇİM MODAL'I EKLİ
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/Toast';
import { useEffect, useState } from 'react';
import { Globe, X, Check } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'tr' | 'en'>('en');

  useEffect(() => {
    // Sayfa yüklendiğinde dil seçimi göster (sadece ilk kez)
    const hasSelectedLanguage = localStorage.getItem('hasSelectedLanguage');
    const savedLang = localStorage.getItem('language') as 'tr' | 'en';
    
    if (!hasSelectedLanguage) {
      setShowLanguageModal(true);
      if (savedLang) {
        setSelectedLang(savedLang);
      }
    } else if (savedLang) {
      setSelectedLang(savedLang);
    }
  }, []);

  const handleLanguageSelect = (lang: 'tr' | 'en') => {
    setSelectedLang(lang);
    localStorage.setItem('language', lang);
    localStorage.setItem('hasSelectedLanguage', 'true');
    setShowLanguageModal(false);
    window.location.reload(); // Sayfayı yenile
  };

  return (
    <html lang={selectedLang} className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-950 text-gray-200 min-h-screen relative`}>
        {/* Dil Seçim Modal'ı */}
        {showLanguageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md animate-scaleIn">
              {/* Modal Content */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                        <Globe className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Welcome to Vogue AI</h2>
                        <p className="text-sm text-gray-400">Please select your language</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLanguageModal(false)}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Language Options */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => handleLanguageSelect('en')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedLang === 'en'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-indigo-500/10'
                          : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-3xl">🇺🇸</div>
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">English</h3>
                          <p className="text-sm text-gray-400">English</p>
                        </div>
                        {selectedLang === 'en' && (
                          <div className="mt-2 p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleLanguageSelect('tr')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedLang === 'tr'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-indigo-500/10'
                          : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-3xl">🇹🇷</div>
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">Türkçe</h3>
                          <p className="text-sm text-gray-400">Turkish</p>
                        </div>
                        {selectedLang === 'tr' && (
                          <div className="mt-2 p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-4">
                      You can change language later from settings
                    </p>
                    <button
                      onClick={() => handleLanguageSelect(selectedLang)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-semibold transition-all duration-300"
                    >
                      Continue with {selectedLang === 'en' ? 'English' : 'Türkçe'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Gradient Effects */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        )}

        {/* Ana İçerik */}
        <ToastProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}