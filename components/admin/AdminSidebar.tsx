"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/actions/auth";

const NAV_ITEMS = [
  { label: "Moderation Queue", icon: "pending_actions", href: "/admin/moderation" },
  { label: "Analytics", icon: "bar_chart", href: "#", soon: true },
  { label: "Settings", icon: "settings", href: "#", soon: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] p-6 bg-[#f6f3f2] rounded-r-3xl hidden lg:flex flex-col z-40">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#006c48]">Admin Panel</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mt-1">
          Management Console
        </p>
      </div>

      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map(({ label, icon, href, soon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#006c48] shadow-sm font-bold"
                  : "text-stone-500 hover:bg-stone-200/50 hover:translate-x-1"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">{icon}</span>
                <span className="text-sm uppercase tracking-widest font-bold">
                  {label}
                </span>
              </span>
              {soon && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-stone-200 text-stone-400 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-2 border-t border-stone-200">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:bg-stone-200/50 hover:translate-x-1 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm uppercase tracking-widest font-bold">
              View Calendar
            </span>
          </Link>
        </div>
      </nav>

      <div className="pt-6 border-t border-stone-200">
        <button
          onClick={signOut}
          disabled={isPending}
          className="flex items-center gap-3 text-stone-500 hover:text-error transition-colors w-full px-4 py-2 rounded-xl hover:bg-error/5 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-sm font-bold uppercase tracking-widest">
            {isPending ? "Signing out…" : "Sign Out"}
          </span>
        </button>
      </div>
    </aside>
  );
}
