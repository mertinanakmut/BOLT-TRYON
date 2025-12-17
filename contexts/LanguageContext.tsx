// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  tr: {
    // Navigation
    'nav.generate': 'Oluştur',
    'nav.history': 'Geçmiş',
    'nav.compare': 'Karşılaştır',
    'nav.generateDesc': 'Yeni AI denemeleri oluştur',
    'nav.historyDesc': 'Geçmiş oluşturmaları görüntüle',
    'nav.compareDesc': 'Yan yana analiz',
    
    // User Menu
    'user.profile': 'Profilim',
    'user.billing': 'Fatura & Planlar',
    'user.analytics': 'Analitik',
    'user.notifications': 'Bildirimler',
    'user.security': 'Güvenlik',
    'user.preferences': 'Tercihler',
    'user.help': 'Yardım Merkezi',
    'user.language': 'Dil',
    
    // Headers
    'header.generate': 'Muhteşem Denemeler Oluştur',
    'header.history': 'Yaratıcı Geçmişiniz',
    'header.compare': 'Karşılaştır & Analiz Et',
    
    // Descriptions
    'desc.generate': 'Model ve kıyafet görsellerini yükleyerek gelişmiş AI algoritmalarıyla fotogerçekçi sanal denemeler oluşturun.',
    'desc.history': 'Önceki oluşturmalarınızı gözden geçirin, oluşturmalarınızı yönetin ve favori sonuçlarınızı dışa aktarın.',
    'desc.compare': 'Birden fazla oluşturmayı seçerek yan yana analiz edin, detayları karşılaştırın ve bilinçli kararlar verin.',
    
    // Stats
    'stats.credits': 'Kredi Bakiyesi',
    'stats.generations': 'Oluşturmalar',
    'stats.creditsUsed': 'Kullanılan Krediler',
    'stats.downloads': 'İndirmeler',
    'stats.favorites': 'Favoriler',
    'stats.availableCredits': 'Kullanılabilir Krediler',
    'stats.of': 'kredi mevcut',
    'stats.upgrade': 'Planı yükselt',
    
    // Features
    'features.ai': 'AI Destekli Sihir',
    'features.aiDesc': 'Gelişmiş sinir ağları mükemmel uyum ve ışıklandırma ile fotogerçekçi sonuçlar oluşturur',
    'features.fast': 'Yıldırım Hızı',
    'features.fastDesc': 'Optimize edilmiş bulut altyapımızla 30 saniyenin altında sonuç üretin',
    'features.security': 'Kurumsal Güvenlik',
    'features.securityDesc': 'Askeri seviye şifreleme ve 24 saat sonra otomatik veri silme',
    
    // Buttons
    'buttons.upgrade': 'Premium\'a Yükselt',
    'buttons.logout': 'Çıkış Yap',
    'buttons.generate': 'Oluştur',
    'buttons.download': 'İndir',
    'buttons.delete': 'Sil',
    'buttons.cancel': 'İptal',
    'buttons.save': 'Kaydet',
    
    // Footer
    'footer.copyright': 'Vogue AI Studio',
    'footer.tagline': 'Sanal moda deneyimlerini yeniden tanımlıyor',
    'footer.terms': 'Hizmet Şartları',
    'footer.privacy': 'Gizlilik Politikası',
    'footer.support': 'Destek',
    'footer.careers': 'Kariyer',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.error': 'Bir hata oluştu',
    'common.success': 'Başarılı',
    'common.warning': 'Uyarı',
    'common.info': 'Bilgi',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    'common.confirm': 'Onayla',
    
    // TryOn Client
    'tryon.modelImage': 'Model Görseli',
    'tryon.tshirtImage': 'Kıyafet Görseli',
    'tryon.upload': 'Yükle',
    'tryon.generate': 'Deneme Oluştur',
    'tryon.generateVideo': 'Video Oluştur',
    'tryon.result': 'Sonuç',
    'tryon.history': 'Geçmiş',
    'tryon.noHistory': 'Henüz geçmiş yok',
    'tryon.selectImages': 'Lütfen önce görsel seçin',
    'tryon.generating': 'Oluşturuluyor...',
    'tryon.success': 'Deneme başarıyla oluşturuldu!',
    
    // Upgrade Page
    'upgrade.title': 'Planınızı Yükseltin',
    'upgrade.subtitle': 'Daha fazla kredi, daha hızlı oluşturma ve gelişmiş özelliklerin kilidini açın',
    'upgrade.current': 'Mevcut Plan',
    'upgrade.free': 'Ücretsiz',
    'upgrade.pro': 'Pro',
    'upgrade.enterprise': 'Kurumsal',
    'upgrade.mostPopular': 'EN POPÜLER',
    'upgrade.creditsIncluded': 'kredi dahil',
    'upgrade.upgradeNow': 'Hemen Yükselt',
    'upgrade.contactSales': 'Satış Ekibiyle İletişime Geçin',
  },
  en: {
    // Navigation
    'nav.generate': 'Generate',
    'nav.history': 'History',
    'nav.compare': 'Compare',
    'nav.generateDesc': 'Create new AI try-ons',
    'nav.historyDesc': 'View past creations',
    'nav.compareDesc': 'Side-by-side analysis',
    
    // User Menu
    'user.profile': 'My Profile',
    'user.billing': 'Billing & Plans',
    'user.analytics': 'Analytics',
    'user.notifications': 'Notifications',
    'user.security': 'Security',
    'user.preferences': 'Preferences',
    'user.help': 'Help Center',
    'user.language': 'Language',
    
    // Headers
    'header.generate': 'Create Stunning Try-Ons',
    'header.history': 'Your Creative History',
    'header.compare': 'Compare & Analyze',
    
    // Descriptions
    'desc.generate': 'Upload model and garment images to generate photorealistic virtual try-ons powered by advanced AI algorithms.',
    'desc.history': 'Browse through your previous generations, manage your creations, and export your favorite results.',
    'desc.compare': 'Select multiple generations to analyze them side-by-side, compare details, and make informed decisions.',
    
    // Stats
    'stats.credits': 'Credits Balance',
    'stats.generations': 'Generations',
    'stats.creditsUsed': 'Credits Used',
    'stats.downloads': 'Downloads',
    'stats.favorites': 'Favorites',
    'stats.availableCredits': 'Available Credits',
    'stats.of': 'credits available',
    'stats.upgrade': 'Upgrade plan',
    
    // Features
    'features.ai': 'AI-Powered Magic',
    'features.aiDesc': 'Advanced neural networks create photorealistic results with perfect fitting and lighting',
    'features.fast': 'Lightning Fast',
    'features.fastDesc': 'Generate results in under 30 seconds with our optimized cloud infrastructure',
    'features.security': 'Enterprise Security',
    'features.securityDesc': 'Military-grade encryption and automatic data deletion after 24 hours',
    
    // Buttons
    'buttons.upgrade': 'Upgrade to Premium',
    'buttons.logout': 'Sign Out',
    'buttons.generate': 'Generate',
    'buttons.download': 'Download',
    'buttons.delete': 'Delete',
    'buttons.cancel': 'Cancel',
    'buttons.save': 'Save',
    
    // Footer
    'footer.copyright': 'Vogue AI Studio',
    'footer.tagline': 'Redefining virtual fashion experiences',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.support': 'Support',
    'footer.careers': 'Careers',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    
    // TryOn Client
    'tryon.modelImage': 'Model Image',
    'tryon.tshirtImage': 'Garment Image',
    'tryon.upload': 'Upload',
    'tryon.generate': 'Generate Try-On',
    'tryon.generateVideo': 'Generate Video',
    'tryon.result': 'Result',
    'tryon.history': 'History',
    'tryon.noHistory': 'No history yet',
    'tryon.selectImages': 'Please select images first',
    'tryon.generating': 'Generating...',
    'tryon.success': 'Try-on successfully generated!',
    
    // Upgrade Page
    'upgrade.title': 'Upgrade Your Plan',
    'upgrade.subtitle': 'Unlock more credits, faster generation, and advanced features',
    'upgrade.current': 'Current Plan',
    'upgrade.free': 'Free',
    'upgrade.pro': 'Pro',
    'upgrade.enterprise': 'Enterprise',
    'upgrade.mostPopular': 'MOST POPULAR',
    'upgrade.creditsIncluded': 'credits included',
    'upgrade.upgradeNow': 'Upgrade Now',
    'upgrade.contactSales': 'Contact Sales',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check localStorage for saved language
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}