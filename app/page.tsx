// app/page.tsx - PROFESYONEL & ELİT TASARIM (YAN MENÜLÜ)
'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TryOnClient } from '@/components/TryOnClient';
import { HistoryGrid } from '@/components/HistoryGrid';
import { CompareView } from '@/components/CompareView';
import { LogoutButton } from '@/components/LogoutButton';
import { Spinner } from '@/components/Spinner';
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
  Heart
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'compare'>('generate');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-gray-800"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-r-indigo-500 animate-spin" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-b-sky-500 animate-spin" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="mt-8 text-gray-300 text-lg font-medium animate-pulse">Initializing Studio...</p>
          <p className="mt-2 text-sm text-gray-500">Loading your creative environment</p>
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
      label: 'Generate', 
      icon: Palette, 
      description: 'Create AI try-ons',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: History, 
      description: 'View past creations',
      color: 'from-blue-500 to-cyan-400'
    },
    { 
      id: 'compare', 
      label: 'Compare', 
      icon: GitCompare, 
      description: 'Side-by-side analysis',
      color: 'from-emerald-500 to-green-400'
    },
  ];

  // User menu items
  const userMenuItems = [
    { label: 'My Profile', icon: User, href: '#', badge: null },
    { label: 'Billing & Plans', icon: CreditCard, href: '/upgrade', badge: 'Pro' },
    { label: 'Analytics', icon: BarChart3, href: '#', badge: null },
    { label: 'Notifications', icon: Bell, href: '#', badge: '3' },
    { label: 'Security', icon: Shield, href: '#', badge: null },
    { label: 'Preferences', icon: Settings, href: '#', badge: null },
    { label: 'Help Center', icon: HelpCircle, href: '#', badge: null },
    { label: 'Language', icon: Globe, href: '#', badge: 'EN' },
  ];

  // Stats data
  const userStats = [
    { label: 'Generations', value: '24', icon: Sparkles, change: '+12%' },
    { label: 'Credits Used', value: '156', icon: Zap, change: '-5%' },
    { label: 'Downloads', value: '89', icon: Download, change: '+23%' },
    { label: 'Favorites', value: '12', icon: Heart, change: '+8%' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
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
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-lg">Vogue AI</h1>
                      <p className="text-xs text-gray-400">Virtual Studio</p>
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
                      Vogue AI
                    </h1>
                    <p className="text-xs text-gray-400">Virtual Try-On Studio</p>
                  </div>
                )}
              </div>
              
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors glass-subtle"
                  title="Collapse sidebar"
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
                    <span className="text-xs text-gray-500">Member since 2024</span>
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
                  <span className="text-sm text-gray-400">Credits Balance</span>
                  <span className="text-lg font-bold text-gradient">{credits}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {credits} of 50 credits available
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

          {/* Bottom Section - User Menu & Settings */}
          <div className="p-4 border-t border-gray-800">
            <div className={`${sidebarCollapsed ? 'flex flex-col items-center space-y-3' : 'space-y-3'}`}>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl hover:bg-gray-800/30 transition-colors`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm">Dark Mode</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className={`w-10 h-6 rounded-full p-1 transition-all ${darkMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : ''}`}></div>
                  </div>
                )}
              </button>

              {/* User Menu Trigger */}
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
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="text-left">
                        <p className="text-sm font-medium">Account</p>
                        <p className="text-xs text-gray-500">Settings & more</p>
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
          
          {/* Collapse/Expand Button (for collapsed state) */}
          {sidebarCollapsed && (
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
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
                    <h1 className="font-bold text-lg">Vogue AI</h1>
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
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
                      <span className="text-xs font-medium text-purple-300">AI-POWERED</span>
                      <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-400">Real-time processing</span>
                    </div>
                    
                    <h1 className="heading-1 mb-4">
                      {activeTab === 'generate' && (
                        <>
                          Create <span className="text-gradient">Stunning</span> Try-Ons
                        </>
                      )}
                      {activeTab === 'history' && (
                        <>
                          Your <span className="text-gradient">Creative</span> History
                        </>
                      )}
                      {activeTab === 'compare' && (
                        <>
                          Compare & <span className="text-gradient">Analyze</span>
                        </>
                      )}
                    </h1>
                    
                    <p className="body-large text-gray-400 max-w-3xl">
                      {activeTab === 'generate' && 'Upload model and garment images to generate photorealistic virtual try-ons powered by advanced AI algorithms.'}
                      {activeTab === 'history' && 'Browse through your previous generations, manage your creations, and export your favorite results.'}
                      {activeTab === 'compare' && 'Select multiple generations to analyze them side-by-side, compare details, and make informed decisions.'}
                    </p>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[300px]">
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Available Credits</p>
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
                        {credits} credits remaining • <a href="/upgrade" className="text-purple-400 hover:text-purple-300">Upgrade plan</a>
                      </p>
                    </div>
                    
                    <a 
                      href="/upgrade" 
                      className="btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Upgrade to Premium</span>
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
                        <span className="text-xs text-gray-500 ml-2">from last month</span>
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
                      <h3 className="font-semibold mb-2">AI-Powered Magic</h3>
                      <p className="text-sm text-gray-400">
                        Advanced neural networks create photorealistic results with perfect fitting and lighting
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
                      <h3 className="font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-sm text-gray-400">
                        Generate results in under 30 seconds with our optimized cloud infrastructure
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
                      <h3 className="font-semibold mb-2">Enterprise Security</h3>
                      <p className="text-sm text-gray-400">
                        Military-grade encryption and automatic data deletion after 24 hours
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
                      © {new Date().getFullYear()} Vogue AI Studio
                    </p>
                    <p className="text-gray-600 text-sm mt-0.5">
                      Redefining virtual fashion experiences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Support</a>
                  <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Careers</a>
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