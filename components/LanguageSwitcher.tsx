// components/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      {/* Dil Değiştirme Butonu - Daha Estetik */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all duration-200 group"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
        <span className="font-medium text-white">
          {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dil Seçim Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menü */}
          <div className="absolute top-full mt-2 right-0 z-50 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                  language === lang.code ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-white">{lang.name}</div>
                    <div className="text-sm text-gray-400">{lang.code.toUpperCase()}</div>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}