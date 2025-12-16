export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TryOnClient } from '@/components/TryOnClient';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <TryOnClient />;
}
