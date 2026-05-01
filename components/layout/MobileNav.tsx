"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Explore", icon: "search", href: "/explore" },
  { label: "Post", icon: "add_circle", href: "/submit" },
  { label: "Profile", icon: "account_circle", href: "/profile" },
] as const;

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white md:hidden border-t border-stone-100 flex justify-around items-center py-4 px-2 z-50">
      {NAV_ITEMS.map(({ label, icon, href }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center gap-1 ${
            pathname === href ? "text-primary" : "text-stone-400"
          }`}
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="text-[10px] font-bold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
