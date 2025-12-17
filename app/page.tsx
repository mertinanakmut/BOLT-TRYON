// app/page.tsx - VERCEL STYLE + MODERN DARK/LIGHT THEME
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
  Check,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Video,
  Layers,
  Cpu,
  Cloud,
  Lock,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'compare'>('generate');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Light mode by default (Vercel style)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Apply theme to HTML
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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="mt-8 text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">{t('common.loading')}</p>
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
      color: 'from-blue-500 to-purple-500'
    },
    { 
      id: 'history', 
      label: t('nav.history'), 
      icon: History, 
      description: t('nav.historyDesc'),
      color: 'from-emerald-500 to-cyan-400'
    },
    { 
      id: 'compare', 
      label: t('nav.compare'), 
      icon: GitCompare, 
      description: t('nav.compareDesc'),
      color: 'from-amber-500 to-orange-400'
    },
  ];

  // Stats data - Vercel style minimal
  const userStats = [
    { label: t('stats.generations'), value: '24', icon: Sparkles, change: '+12%' },
    { label: t('stats.creditsUsed'), value: '156', icon: Activity, change: '-5%' },
    { label: t('stats.downloads'), value: '89', icon: Download, change: '+23%' },
    { label: t('stats.favorites'), value: '12', icon: Heart, change: '+8%' },
  ];

  const features = [
    {
      icon: Cpu,
      title: t('features.ai'),
      description: t('features.aiDesc'),
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: Zap,
      title: t('features.fast'),
      description: t('features.fastDesc'),
      gradient: 'from-emerald-500 to-cyan-400'
    },
    {
      icon: Shield,
      title: t('features.security'),
      description: t('features.securityDesc'),
      gradient: 'from-amber-500 to-orange-400'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl animate-slideIn">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">{t('app.title')}</h1>
                    <p className="text-xs text-gray-500">{t('mobile.virtualStudio')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {tab.label}
                      </p>
                      <p className="text-xs text-gray-500">{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile User Info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {user.email?.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                      PRO
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t('user.memberSince')} 2024</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {darkMode ? t('mode.light') : t('mode.dark')}
                  </span>
                  {darkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>
                
                <div className="w-full">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside 
        ref={sidebarRef}
        className={`
          hidden lg:flex fixed top-0 left-0 bottom-0 z-40
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          transition-all duration-300
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          shadow-sm
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? '' : 'space-x-3'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-bold text-lg text-gray-900 dark:text-white">{t('app.title')}</h1>
                  <p className="text-xs text-gray-500">{t('mobile.virtualStudio')}</p>
                </div>
              )}
            </div>
            
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile Summary */}
        {!sidebarCollapsed && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-lg">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {user.email?.split('@')[0]}
                </h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    PRO
                  </span>
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
                    w-full flex items-center rounded-xl p-3 transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                    ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}
                    group
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-br ${tab.color} shadow-sm` 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                    }
                  `}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                          {tab.label}
                        </p>
                      </div>
                      {!sidebarCollapsed && (
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`}>
                          {tab.description}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Credits & Quick Stats */}
        {!sidebarCollapsed && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.credits')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{credits}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {credits} {t('stats.of')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {userStats.slice(0, 2).map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-white dark:bg-gray-700 shadow-sm">
                        <Icon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</span>
                      <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className={`${sidebarCollapsed ? 'flex flex-col items-center space-y-3' : 'space-y-3'}`}>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
              title={darkMode ? t('mode.switchLight') : t('mode.switchDark')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {darkMode ? t('mode.light') : t('mode.dark')}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className={`w-9 h-5 rounded-full p-0.5 transition-all ${darkMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${darkMode ? 'translate-x-4' : ''}`} />
                </div>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                )}
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && !sidebarCollapsed && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg animate-fadeIn">
                  <div className="p-2">
                    <a
                      href="/upgrade"
                      className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-800">
                          <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t('user.billing')}</span>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        PRO
                      </span>
                    </a>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
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
        min-h-screen transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900 dark:text-white">{t('app.title')}</h1>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <div className="flex items-center px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20">
                      <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400 mr-1" />
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{credits}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title={darkMode ? t('mode.switchLight') : t('mode.switchDark')}
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center relative"
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${isActive ? `bg-gradient-to-br ${tab.color}` : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
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
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-4">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('stats.aiPowered')}</span>
                    <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('stats.realTimeProcessing')}</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    {activeTab === 'generate' && t('header.generate')}
                    {activeTab === 'history' && t('header.history')}
                    {activeTab === 'compare' && t('header.compare')}
                  </h1>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                    {activeTab === 'generate' && t('desc.generate')}
                    {activeTab === 'history' && t('desc.history')}
                    {activeTab === 'compare' && t('desc.compare')}
                  </p>
                </div>
                
                {/* Stats Cards */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[300px]">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.availableCredits')}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{credits}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {credits} {t('stats.of')} •{' '}
                      <a 
                        href="/upgrade" 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        {t('stats.upgrade')}
                      </a>
                    </p>
                  </div>
                  
                  <a 
                    href="/upgrade" 
                    className="inline-flex items-center justify-center space-x-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
                  <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{t('stats.fromLastMonth')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 lg:p-8">
                {activeTab === 'generate' && <TryOnClient />}
                {activeTab === 'history' && <HistoryGrid userId={user.id} />}
                {activeTab === 'compare' && <CompareView userId={user.id} />}
              </div>
            </div>

            {/* Features Showcase */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('features.showcase')}</h2>
                <p className="text-gray-600 dark:text-gray-400">Everything you need for professional virtual try-ons</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500"></div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} {t('footer.copyright')}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-0.5">
                    {t('footer.tagline')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm transition-colors">
                  {t('footer.terms')}
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm transition-colors">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm transition-colors">
                  {t('footer.support')}
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm transition-colors">
                  {t('footer.careers')}
                </a>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Powered by Fal AI • Built with Next.js 14 & Supabase • Hosted on Vercel
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
