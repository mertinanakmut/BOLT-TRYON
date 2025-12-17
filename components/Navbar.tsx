// components/Navbar.tsx - VERCEL STYLE
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import NavbarAuth from "@/components/NavbarAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function Navbar() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Sol Taraf: Logo ve Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Vogue AI
              </span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              <Link 
                href="/generate" 
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                Generate
              </Link>
              <Link 
                href="/history" 
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                History
              </Link>
              <Link 
                href="/compare" 
                className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                Compare
              </Link>
            </div>
          </div>

          {/* Sağ Taraf: Dil ve Auth */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <NavbarAuth user={user} />
          </div>
        </div>
      </div>
    </nav>
  );
}
