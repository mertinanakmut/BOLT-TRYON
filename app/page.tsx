// app/page.tsx - DARK MODE FIX + MULTI LANGUAGE SUPPORT - DÜZENLENMİŞ
'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TryOnClient } from '@/components/TryOnClient';
import { HistoryGrid } from '@/components/HistoryGrid';
import { CompareView } from '@/components/CompareView';
import { LogoutButton } from '@/components/LogoutButton';
import { Spinner } from '@/components/Spinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Palette, 
  History, 
  GitCompare, 
  Zap, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  HelpCircle,
  Sparkles,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Download,
  Upload,
  Camera,
  ShoppingBag,
  Grid3x3,
  Menu,
  X,
  Home,
  Users,
  FileText,
  MessageSquare,
  Heart,
  Globe2,
  Check
} from 'lucide-react';

export default function HomePage() {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'compare'>('generate');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // DEBUG: Dil değişikliklerini takip et
  useEffect(() => {
    console.log('Dil değişti:', language);
    console.log('Test çeviri:', t('header.generate'));
  }, [language, t]);

  // Dark mode'u HTML'e uygula
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          setCredits(profile.credits || 15);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-gray-800"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-purple-500 animate-spin"></div>
          </div>
          <p className="mt-8 text-gray-300 text-lg font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Navigation tabs
  const tabs = [
    { 
      id: 'generate', 
      label: t('nav.generate'), 
      icon: Palette, 
      description: t('nav.generateDesc'),
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'history', 
      label: t('nav.history'), 
      icon: History, 
      description: t('nav.historyDesc'),
      color: 'from-blue-500 to-cyan-400'
    },
    { 
      id: 'compare', 
      label: t('nav.compare'), 
      icon: GitCompare, 
      description: t('nav.compareDesc'),
      color: 'from-emerald-500 to-green-400'
    },
  ];

  // User menu items
  const userMenuItems = [
    { label: t('user.profile'), icon: User, href: '#', badge: null },
    { label: t('user.billing'), icon: CreditCard, href: '/upgrade', badge: 'Pro' },
    { label: t('user.analytics'), icon: BarChart3, href: '#', badge: null },
    { label: t('user.notifications'), icon: Bell, href: '#', badge: '3' },
    { label: t('user.security'), icon: Shield, href: '#', badge: null },
    { label: t('user.preferences'), icon: Settings, href: '#', badge: null },
    { label: t('user.help'), icon: HelpCircle, href: '#', badge: null },
  ];

  // Stats data
  const userStats = [
    { label: t('stats.generations'), value: '24', icon: Sparkles, change: '+12%' },
    { label: t('stats.creditsUsed'), value: '156', icon: Zap, change: '-5%' },
    { label: t('stats.downloads'), value: '89', icon: Download, change: '+23%' },
    { label: t('stats.favorites'), value: '12', icon: Heart, change: '+8%' },
  ];

  // Languages
  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="min-h-screen">
      {/* DEBUG PANEL */}
      <div className="fixed top-20 left-4 z-50 flex items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('tr')}
            className={`px-3 py-1 rounded ${language === 'tr' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            TR
          </button>
        </div>
        <div className="text-sm">
          {language === 'en' ? 'Language' : 'Dil'}: {language} | 
// //           {language === 'en' ? ' Working?' : ' Çalışıyor mu?'}: {t('common.yes')}
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-gray-200">
        
        {/* MOBILE MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 animate-slideIn">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-lg">{t('app.title')}</h1>
                      <p className="text-xs text-gray-400">{t('mobile.virtualStudio')}</p>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <div className="p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl mb-2 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20' 
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {tab.label}
                        </p>
                        <p className="text-xs text-gray-500">{tab.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR - DESKTOP */}
        <aside 
          ref={sidebarRef}
          className={`
            hidden lg:flex fixed top-0 left-0 bottom-0 z-40
            ${sidebarCollapsed ? 'w-24' : 'w-80'}
            sidebar-transition
            glass-panel
            border-r border-gray-800
            flex flex-col
            shadow-2xl shadow-black/30
          `}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-800">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="font-bold text-xl bg-gradient-to-r from-purple-300 via-pink-300 to-sky-300 bg-clip-text text-transparent">
                      {t('app.title')}
                    </h1>
                    <p className="text-xs text-gray-400">{t('mobile.virtualStudio')}</p>
                  </div>
                )}
              </div>
              
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors glass-subtle"
                  title={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* User Profile Summary */}
          {!sidebarCollapsed && (
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{user.email?.split('@')[0]}</h3>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                      <span className="text-xs font-bold text-amber-300">PRO</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t('user.memberSince')} 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      w-full flex items-center rounded-2xl p-4 transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border border-purple-500/20 shadow-lg' 
                        : 'hover:bg-gray-800/30 hover:border-gray-700/50 hover:shadow-md'
                      }
                      ${sidebarCollapsed ? 'justify-center' : 'space-x-4'}
                      group
                    `}
                  >
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${tab.color} shadow-lg` 
                        : 'bg-gray-800 group-hover:bg-gray-700'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`} />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            {tab.label}
                          </p>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${isActive ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
                          {tab.description}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Credits & Quick Stats */}
          {!sidebarCollapsed && (
            <div className="p-6 border-t border-gray-800">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{t('stats.credits')}</span>
                  <span className="text-lg font-bold text-gradient">{credits}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {credits} {t('stats.of')}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {userStats.slice(0, 2).map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="glass-subtle rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-gray-800/50">
                          <Icon className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400">{stat.label}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-bold">{stat.value}</span>
                        <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Section - Settings */}
          <div className="p-4 border-t border-gray-800">
            <div className={`${sidebarCollapsed ? 'flex flex-col items-center space-y-3' : 'space-y-3'}`}>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl hover:bg-gray-800/30 transition-colors`}
                title={darkMode ? t('mode.switchLight') : t('mode.switchDark')}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm">{darkMode ? t('mode.light') : t('mode.dark')}</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className={`w-10 h-6 rounded-full p-1 transition-all ${darkMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : ''}`}></div>
                  </div>
                )}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} w-full p-3 rounded-xl hover:bg-gray-800/30 transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-800/50">
                      <Globe2 className="w-4 h-4 text-gray-400" />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left">
                        <p className="text-sm">{t('user.language')}</p>
                        <p className="text-xs text-gray-500">
                          {language === 'tr' ? 'Türkçe' : 'English'}
                        </p>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 glass-panel rounded-2xl border border-gray-800 shadow-2xl animate-fadeIn">
                    <div className="p-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as 'tr' | 'en');
                            setShowLanguageMenu(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                          </div>
                          {language === lang.code && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl hover:bg-gray-800/30 transition-colors group`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left">
                        <p className="text-sm font-medium">{t('user.profile')}</p>
                        <p className="text-xs text-gray-500">{t('user.settingsMore')}</p>
                      </div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 glass-panel rounded-2xl border border-gray-800 shadow-2xl animate-fadeIn">
                    <div className="p-2">
                      {userMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={index}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50">
                                <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                              </div>
                              <span className="text-sm">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300">
                                {item.badge}
                              </span>
                            )}
                          </a>
                        );
                      })}
                      
                      <div className="mt-2 pt-2 border-t border-gray-800">
                        <div className="px-3 py-2">
                          <LogoutButton />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className={`
          min-h-screen
          ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'}
          sidebar-transition
        `}>
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-30 glass-panel border-b border-gray-800">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-800/50"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">{t('app.title')}</h1>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className="flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20">
                        <Zap className="w-3 h-3 text-amber-400 mr-1" />
                        <span className="text-xs font-bold">{credits}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg hover:bg-gray-800/50"
                    title={darkMode ? t('mode.switchLight') : t('mode.switchDark')}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center relative"
                  >
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Mobile Tabs */}
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20' 
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? `bg-gradient-to-br ${tab.color}` : 'bg-gray-800'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8 lg:mb-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 mb-4">
                      <span className="text-xs font-medium text-purple-300">{t('stats.aiPowered')}</span>
                      <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-400">{t('stats.realTimeProcessing')}</span>
                    </div>
                    
                    <h1 className="heading-1 mb-4">
                      {activeTab === 'generate' && (
                        <>{t('header.generate')}</>
                      )}
                      {activeTab === 'history' && (
                        <>{t('header.history')}</>
                      )}
                      {activeTab === 'compare' && (
                        <>{t('header.compare')}</>
                      )}
                    </h1>
                    
                    <p className="body-large text-gray-400 max-w-3xl">
                      {activeTab === 'generate' && t('desc.generate')}
                      {activeTab === 'history' && t('desc.history')}
                      {activeTab === 'compare' && t('desc.compare')}
                    </p>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[300px]">
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">{t('stats.availableCredits')}</p>
                          <p className="text-3xl font-bold text-gradient">{credits}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
                          <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {credits} {t('stats.of')} • <a href="/upgrade" className="text-purple-400 hover:text-purple-300">{t('stats.upgrade')}</a>
                      </p>
                    </div>
                    
                    <a 
                      href="/upgrade" 
                      className="btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>{t('buttons.upgrade')}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {userStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="glass-card p-4 card-hover">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-800/50">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{t('stats.fromLastMonth')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 lg:p-8">
                  {activeTab === 'generate' && <TryOnClient />}
                  {activeTab === 'history' && <HistoryGrid userId={user.id} />}
                  {activeTab === 'compare' && <CompareView userId={user.id} />}
                </div>
              </div>

              {/* Features Showcase */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 card-floating">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t('features.ai')}</h3>
                      <p className="text-sm text-gray-400">
                        {t('features.aiDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 card-floating">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t('features.fast')}</h3>
                      <p className="text-sm text-gray-400">
                        {t('features.fastDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 card-floating">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{t('features.security')}</h3>
                      <p className="text-sm text-gray-400">
                        {t('features.securityDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-800/50 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600"></div>
                  <div>
                    <p className="text-gray-500 text-sm">
                      © {new Date().getFullYear()} {t('footer.copyright')}
                    </p>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {t('footer.tagline')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{t('footer.terms')}</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{t('footer.privacy')}</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{t('footer.support')}</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{t('footer.careers')}</a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-800/30 text-center">
                <p className="text-xs text-gray-600">
                  Powered by Fal AI • Built with Next.js 14 & Supabase • Hosted on Vercel
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
