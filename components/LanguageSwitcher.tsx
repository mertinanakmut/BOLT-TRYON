// components/LanguageSwitcher.tsx
'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'tr' : 'en';
    setLanguage(newLang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        title={language === 'en' ? 'Switch to Turkish' : 'Türkçeye geç'}
      >
        <Globe className="w-5 h-5" />
        <span className="font-medium">
          {language === 'en' ? 'EN' : 'TR'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between ${
              language === 'en' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
            }`}
          >
            <span>English</span>
            {language === 'en' && (
              <span className="text-green-400">✓</span>
            )}
          </button>
          <div className="border-t border-gray-700"></div>
          <button
            onClick={() => {
              setLanguage('tr');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between ${
              language === 'tr' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
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
  );
}