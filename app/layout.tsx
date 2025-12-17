// app/layout.tsx - VERCEL STYLE + LANGUAGE MODAL
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
      setTimeout(() => {
        setShowLanguageModal(true);
      }, 500); // 0.5 saniye sonra göster
      
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
  };

  return (
    <html lang={selectedLang} className={inter.className}>
      <head>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {/* Dil Seçim Modal'ı - Vercel Style */}
        {showLanguageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md animate-scaleIn">
              {/* Modal Content */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Globe className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Welcome to Vogue AI</h2>
                        <p className="text-sm text-gray-500">Please select your preferred language</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLanguageModal(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Language Options */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => handleLanguageSelect('en')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedLang === 'en'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl">🇺🇸</div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">English</h3>
                          <p className="text-xs text-gray-500 mt-0.5">English</p>
                        </div>
                        {selectedLang === 'en' && (
                          <div className="mt-1 p-1 rounded-full bg-blue-500">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleLanguageSelect('tr')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedLang === 'tr'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl">🇹🇷</div>
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900">Türkçe</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Turkish</p>
                        </div>
                        {selectedLang === 'tr' && (
                          <div className="mt-1 p-1 rounded-full bg-blue-500">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      You can change language anytime from the language switcher
                    </p>
                    <button
                      onClick={() => handleLanguageSelect(selectedLang)}
                      className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      Continue with {selectedLang === 'en' ? 'English' : 'Türkçe'}
                    </button>
                  </div>
                </div>
              </div>
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