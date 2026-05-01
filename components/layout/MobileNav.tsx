"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "ORGANIZER";
  emailVerified: boolean;
}

export default function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  // Hide on admin pages — they have their own drawer
  if (pathname.startsWith("/admin")) return null;

  const items: { label: string; icon: string; href: string; active: boolean }[] = [
    {
      label: "Home",
      icon: "home",
      href: "/",
      active: pathname === "/",
    },
  ];

  // Admins don't submit events; everyone else gets the Submit tab
  if (user?.role !== "ADMIN") {
    items.push({
      label: "Submit",
      icon: "add_circle",
      href: "/submit",
      active: pathname.startsWith("/submit"),
    });
  }

  if (user) {
    if (user.role === "ADMIN") {
      items.push({
        label: "Admin",
        icon: "admin_panel_settings",
        href: "/admin/moderation",
        active: false,
      });
    } else {
      items.push({
        label: "Profile",
        icon: "account_circle",
        href: `/profile/${user.id}`,
        active: pathname === `/profile/${user.id}`,
      });
    }
  } else {
    items.push({
      label: "Sign In",
      icon: "login",
      href: "/login",
      active: pathname === "/login" || pathname === "/signup",
    });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-white md:hidden border-t border-stone-200/70 flex justify-around items-center py-2 px-2 z-30"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map(({ label, icon, href, active }) => (
        <Link
          key={label}
          href={href}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
            active ? "text-primary" : "text-stone-400 hover:text-stone-600"
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={
              active ? { fontVariationSettings: "'FILL' 1" } : undefined
            }
          >
            {icon}
          </span>
          <span className="text-[10px] font-bold">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
