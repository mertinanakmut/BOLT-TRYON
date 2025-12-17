// contexts/LanguageContext.tsx - TÜM EKSİKLER TAMAMLANDI
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
    'user.memberSince': 'Üyelik tarihi',
    'user.settingsMore': 'Ayarlar & daha fazlası',
    
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
    'stats.fromLastMonth': 'geçen aydan',
    'stats.realTimeProcessing': 'Gerçek zamanlı işleme',
    'stats.aiPowered': 'AI Destekli',
    
    // Features
    'features.ai': 'AI Destekli Sihir',
    'features.aiDesc': 'Gelişmiş sinir ağları mükemmel uyum ve ışıklandırma ile fotogerçekçi sonuçlar oluşturur',
    'features.fast': 'Yıldırım Hızı',
    'features.fastDesc': 'Optimize edilmiş bulut altyapımızla 30 saniyenin altında sonuç üretin',
    'features.security': 'Kurumsal Güvenlik',
    'features.securityDesc': 'Askeri seviye şifreleme ve 24 saat sonra otomatik veri silme',
    'features.showcase': 'Özellikler',
    
    // Buttons
    'buttons.upgrade': 'Premium\'a Yükselt',
    'buttons.logout': 'Çıkış Yap',
    'buttons.generate': 'Oluştur',
    'buttons.download': 'İndir',
    'buttons.delete': 'Sil',
    'buttons.cancel': 'İptal',
    'buttons.save': 'Kaydet',
    'buttons.login': 'Giriş Yap',
    'buttons.register': 'Kayıt Ol',
    'buttons.back': 'Stüdyoya Geri Dön',
    
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
    
    // App
    'app.title': 'Vogue AI',
    'mobile.virtualStudio': 'Sanal Stüdyo',
    'mobile.menu': 'Menü',
    
    // Sidebar
    'sidebar.collapse': 'Kenar çubuğunu daralt',
    'sidebar.expand': 'Kenar çubuğunu genişlet',
    
    // Mode
    'mode.light': 'Açık Mod',
    'mode.dark': 'Koyu Mod',
    'mode.switchLight': 'Açık moda geç',
    'mode.switchDark': 'Koyu moda geç',
    
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
    'upgrade.experience': 'Deneyiminizi yükseltin',
    'upgrade.creativePower': 'Yaratıcı Gücünüzü',
    'upgrade.success': 'Başarıyla yükseltildi',
    'upgrade.plan': 'planına',
    'upgrade.failed': 'Yükseltme başarısız. Lütfen tekrar deneyin.',
    'upgrade.forever': 'süresiz',
    'upgrade.perMonth': 'aylık',
    'upgrade.freeTier': 'Ücretsiz Seviye',
    'upgrade.needHelp': 'Plan seçiminde yardıma mı ihtiyacınız var?',
    'upgrade.contactSupport': 'Destek Ekibiyle İletişime Geçin',
    
    // Upgrade Features
    'upgrade.features.free.credits': '5 ücretsiz kredi aylık',
    'upgrade.features.free.generation': 'Temel görüntü oluşturma',
    'upgrade.features.free.resolution': 'Standart çözünürlük',
    'upgrade.features.free.support': 'Topluluk desteği',
    'upgrade.features.free.retention': '7 gün geçmiş saklama',
    
    'upgrade.features.pro.credits': '100 kredi aylık',
    'upgrade.features.pro.generation': 'HD görüntü oluşturma',
    'upgrade.features.pro.video': 'Video oluşturma',
    'upgrade.features.pro.support': 'Öncelikli destek',
    'upgrade.features.pro.retention': '30 gün geçmiş saklama',
    'upgrade.features.pro.batch': 'Toplu işleme',
    'upgrade.features.pro.api': 'API erişimi',
    
    'upgrade.features.enterprise.credits': '1000 kredi aylık',
    'upgrade.features.enterprise.generation': '4K görüntü oluşturma',
    'upgrade.features.enterprise.video': 'Sınırsız video oluşturma',
    'upgrade.features.enterprise.support': '7/24 özel destek',
    'upgrade.features.enterprise.history': 'Sınırsız geçmiş',
    'upgrade.features.enterprise.models': 'Özel AI modelleri',
    'upgrade.features.enterprise.whiteLabel': 'White-label çözümü',
    'upgrade.features.enterprise.team': 'Takım yönetimi',
    
    // Upgrade FAQ
    'upgrade.faq.title': 'Sıkça Sorulan Sorular',
    'upgrade.faq.credits.question': 'Kullanılmayan kredilerime ne olur?',
    'upgrade.faq.credits.answer': 'Pro ve Enterprise planlarında kullanılmayan krediler sonraki aya aktarılır. Ücretsiz plan kredileri aylık olarak sıfırlanır.',
    'upgrade.faq.cancel.question': 'İstediğim zaman iptal edebilir miyim?',
    'upgrade.faq.cancel.answer': 'Evet! Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Faturalandırma döneminizin sonuna kadar erişiminiz devam eder.',
    'upgrade.faq.refunds.question': 'İade sunuyor musunuz?',
    'upgrade.faq.refunds.answer': 'Memnun kalmazsanız tüm ücretli planlar için 14 günlük para iade garantisi sunuyoruz.',
    'upgrade.faq.change.question': 'Planımı yükseltebilir/indirgeyebilir miyim?',
    'upgrade.faq.change.answer': 'Evet, planınızı istediğiniz zaman değiştirebilirsiniz. Değişiklikler anında geçerli olur.',
    
    // Upgrade Footer
    'upgrade.footer.poweredBy': 'Virtual Try-On Studio • Fal AI tarafından desteklenmektedir • Stripe ile güvenli ödemeler',
    'upgrade.footer.rights': 'Tüm hakları saklıdır.',
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
    'user.memberSince': 'Member since',
    'user.settingsMore': 'Settings & more',
    
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
    'stats.fromLastMonth': 'from last month',
    'stats.realTimeProcessing': 'Real-time processing',
    'stats.aiPowered': 'AI-Powered',
    
    // Features
    'features.ai': 'AI-Powered Magic',
    'features.aiDesc': 'Advanced neural networks create photorealistic results with perfect fitting and lighting',
    'features.fast': 'Lightning Fast',
    'features.fastDesc': 'Generate results in under 30 seconds with our optimized cloud infrastructure',
    'features.security': 'Enterprise Security',
    'features.securityDesc': 'Military-grade encryption and automatic data deletion after 24 hours',
    'features.showcase': 'Features',
    
    // Buttons
    'buttons.upgrade': 'Upgrade to Premium',
    'buttons.logout': 'Sign Out',
    'buttons.generate': 'Generate',
    'buttons.download': 'Download',
    'buttons.delete': 'Delete',
    'buttons.cancel': 'Cancel',
    'buttons.save': 'Save',
    'buttons.login': 'Login',
    'buttons.register': 'Register',
    'buttons.back': 'Back to Studio',
    
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
    
    // App
    'app.title': 'Vogue AI',
    'mobile.virtualStudio': 'Virtual Studio',
    'mobile.menu': 'Menu',
    
    // Sidebar
    'sidebar.collapse': 'Collapse sidebar',
    'sidebar.expand': 'Expand sidebar',
    
    // Mode
    'mode.light': 'Light Mode',
    'mode.dark': 'Dark Mode',
    'mode.switchLight': 'Switch to light mode',
    'mode.switchDark': 'Switch to dark mode',
    
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
    'upgrade.experience': 'Upgrade your experience',
    'upgrade.creativePower': 'Creative Power',
    'upgrade.success': 'Successfully upgraded to',
    'upgrade.plan': 'plan',
    'upgrade.failed': 'Upgrade failed. Please try again.',
    'upgrade.forever': 'forever',
    'upgrade.perMonth': 'per month',
    'upgrade.freeTier': 'Free Tier',
    'upgrade.needHelp': 'Need help choosing a plan?',
    'upgrade.contactSupport': 'Contact Support Team',
    
    // Upgrade Features
    'upgrade.features.free.credits': '5 free credits monthly',
    'upgrade.features.free.generation': 'Basic image generation',
    'upgrade.features.free.resolution': 'Standard resolution',
    'upgrade.features.free.support': 'Community support',
    'upgrade.features.free.retention': '7-day history retention',
    
    'upgrade.features.pro.credits': '100 credits monthly',
    'upgrade.features.pro.generation': 'HD image generation',
    'upgrade.features.pro.video': 'Video generation',
    'upgrade.features.pro.support': 'Priority support',
    'upgrade.features.pro.retention': '30-day history retention',
    'upgrade.features.pro.batch': 'Batch processing',
    'upgrade.features.pro.api': 'API access',
    
    'upgrade.features.enterprise.credits': '1000 credits monthly',
    'upgrade.features.enterprise.generation': '4K image generation',
    'upgrade.features.enterprise.video': 'Unlimited video generation',
    'upgrade.features.enterprise.support': '24/7 dedicated support',
    'upgrade.features.enterprise.history': 'Unlimited history',
    'upgrade.features.enterprise.models': 'Custom AI models',
    'upgrade.features.enterprise.whiteLabel': 'White-label solution',
    'upgrade.features.enterprise.team': 'Team management',
    
    // Upgrade FAQ
    'upgrade.faq.title': 'Frequently Asked Questions',
    'upgrade.faq.credits.question': 'What happens to my unused credits?',
    'upgrade.faq.credits.answer': 'Unused credits roll over to the next month for Pro and Enterprise plans. Free plan credits reset monthly.',
    'upgrade.faq.cancel.question': 'Can I cancel anytime?',
    'upgrade.faq.cancel.answer': 'Yes! You can cancel your subscription anytime. You\'ll keep access until the end of your billing period.',
    'upgrade.faq.refunds.question': 'Do you offer refunds?',
    'upgrade.faq.refunds.answer': 'We offer a 14-day money-back guarantee for all paid plans if you\'re not satisfied.',
    'upgrade.faq.change.question': 'Can I upgrade/downgrade my plan?',
    'upgrade.faq.change.answer': 'Yes, you can change your plan at any time. Changes take effect immediately.',
    
    // Upgrade Footer
    'upgrade.footer.poweredBy': 'Virtual Try-On Studio • Powered by Fal AI • Secure payments with Stripe',
    'upgrade.footer.rights': 'All rights reserved.',
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
    console.log('Dil değiştiriliyor:', lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    if (!translation) {
      console.warn(`Çeviri bulunamadı: ${key} (${language})`);
      return key;
    }
    return translation;
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