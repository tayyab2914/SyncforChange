"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  function signOut() {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <>
      {/* Mobile menu trigger — bottom-right FAB */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl shadow-primary/30 hover:scale-95 transition-transform"
        aria-label="Open admin menu"
      >
        <span className="material-symbols-outlined text-base">menu</span>
        <span className="text-sm font-bold">Menu</span>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed bg-[#f6f3f2] flex flex-col z-50 transition-transform duration-300
          left-0 top-0 lg:top-20
          h-screen lg:h-[calc(100vh-5rem)]
          w-[88vw] max-w-[320px] lg:w-64
          p-6 rounded-r-3xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#006c48]">Admin Panel</h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-bold mt-1">
              Management Console
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-stone-200 transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
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
    </>
  );
}
