'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Home Page Session:', session);
      console.log('Home Page User:', session?.user);
    };
    
    checkAuth();
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth State Changed:', event, session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}