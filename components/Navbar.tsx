// components/Navbar.tsx
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import NavbarAuth from "@/components/NavbarAuth";

export default async function Navbar() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <Link href="/" className="font-semibold">
        Virtual Try-On
      </Link>

      <NavbarAuth user={user} />
    </nav>
  );
}
