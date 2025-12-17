// app/loading.tsx
import { Spinner } from '@/components/Spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="space-y-4 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}