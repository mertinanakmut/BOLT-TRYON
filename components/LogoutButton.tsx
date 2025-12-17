// components/LogoutButton.tsx - VERCEL STYLE
'use client';

import { useState } from 'react';
import { LogOut, User, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  
  const supabase = createClient();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Language Switcher - Using the existing component */}
      <LanguageSwitcher />
      
      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setUserMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-gray-200 bg-white shadow-lg animate-slideUp">
              <div className="p-2">
                <div className="px-3 py-2 mb-2">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">user@example.com</p>
                </div>
                
                <div className="space-y-1">
                  <a
                    href="/dashboard"
                    className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">Dashboard</span>
                  </a>
                  
                  <a
                    href="/upgrade"
                    className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm">Upgrade</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                        PRO
                      </span>
                    </div>
                  </a>
                  
                  <a
                    href="/settings"
                    className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">Settings</span>
                  </a>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{t('buttons.logout') || 'Sign out'}</span>
                    </div>
                    {loading && (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}