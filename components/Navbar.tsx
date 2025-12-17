// components/Navbar.tsx
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
    <nav className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-900">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-white">
          Vogue AI Studio
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/generate" className="text-gray-300 hover:text-white transition-colors">
            Generate
          </Link>
          <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
            History
          </Link>
          <Link href="/compare" className="text-gray-300 hover:text-white transition-colors">
            Compare
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Dil değiştirme butonu */}
        <LanguageSwitcher />
        
        {/* Auth component'i */}
        <NavbarAuth user={user} />
      </div>
    </nav>
  );
}