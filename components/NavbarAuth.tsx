'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';
import { User } from '@supabase/supabase-js';

type Props = {
  user: User | null;
};

export default function NavbarAuth({ user }: Props) {
  if (user) {
    return <LogoutButton />;
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/login">Giriş</Link>
      <Link href="/auth/register">Kayıt Ol</Link>
    </div>
  );
}
