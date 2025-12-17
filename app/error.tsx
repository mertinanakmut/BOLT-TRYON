// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hata logging servisine gönder
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-red-600">
          Bir şeyler yanlış gitti!
        </h2>
        <p className="text-muted-foreground">
          {error.message || 'Beklenmeyen bir hata oluştu.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Tekrar Dene
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    </div>
  );
}