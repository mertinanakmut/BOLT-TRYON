// components/NavbarAuth.tsx
'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = {
  user: User | null;
};

export default function NavbarAuth({ user }: Props) {
  const { t } = useLanguage();

  if (user) {
    return <LogoutButton />;
  }

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/auth/login"
        className="px-4 py-2 text-gray-300 hover:text-white transition-colors hover:underline"
      >
        {t('buttons.login') || 'Login'}
      </Link>
      <Link 
        href="/auth/register"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
      >
        {t('buttons.register') || 'Register'}
      </Link>
    </div>
  );
}
