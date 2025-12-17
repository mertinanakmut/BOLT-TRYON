// components/NavbarAuth.tsx - VERCEL STYLE
'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { User as UserIcon } from 'lucide-react';

type Props = {
  user: User | null;
};

export default function NavbarAuth({ user }: Props) {
  const { t } = useLanguage();

  if (user) {
    return <LogoutButton />;
  }

  return (
    <div className="flex items-center space-x-3">
      <Link 
        href="/auth/login"
        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        {t('buttons.login') || 'Sign in'}
      </Link>
      <Link 
        href="/auth/register"
        className="text-sm font-medium bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {t('buttons.register') || 'Get started'}
      </Link>
    </div>
  );
}