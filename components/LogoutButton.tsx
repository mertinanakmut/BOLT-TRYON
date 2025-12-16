// components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client'; // DÜZELTME: Doğrudan supabase import et

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/auth/login');
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="border-white/20 text-white hover:bg-white/10"
    >
      Logout
    </Button>
  );
}