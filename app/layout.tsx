// app/layout.tsx - DARK MODE FIX + MULTI LANGUAGE
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/Toast'; // Veya '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vogue AI - Virtual Try-On Studio',
  description: 'AI-powered virtual try-on platform with professional results',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-950 text-gray-200`}>
        <LanguageProvider>
          <ToastProvider> {/* ToastProvider ile sarmalayın */}
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}