"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useRef } from "react";
import { logoutAction } from "@/actions/auth";

interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "ORGANIZER";
  emailVerified: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    startTransition(async () => {
      await logoutAction();
      setUser(null);
      router.push("/");
      router.refresh();
    });
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? "";

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/85 backdrop-blur-xl border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8 h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <span
              className="material-symbols-outlined text-white text-lg"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
            >
              sync
            </span>
          </span>
          <span className="text-lg font-black text-on-surface tracking-tight">
            Sync<span className="text-primary">for</span>Change
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Submit Event — pill with icon */}
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[0.98] transition-all"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            Submit Event
          </Link>

          {/* Mobile-only compact submit button */}
          <Link
            href="/submit"
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/20"
            aria-label="Submit Event"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
          </Link>

          {user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {initials}
                </span>
                <span
                  className={`material-symbols-outlined text-stone-400 text-base transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-on-surface/10 border border-stone-100 overflow-hidden">
                  <div className="px-4 py-4 bg-gradient-to-br from-primary/5 to-tertiary/5 border-b border-stone-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-on-surface truncate mt-0.5">
                      {user.email}
                    </p>
                    {user.role === "ADMIN" && (
                      <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="p-1.5">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/moderation"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-stone-400">
                          admin_panel_settings
                        </span>
                        Admin Panel
                      </Link>
                    )}
                    {user.role === "ORGANIZER" && (
                      <>
                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base text-stone-400">
                            account_circle
                          </span>
                          My Profile
                        </Link>
                        <Link
                          href="/profile/setup"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base text-stone-400">
                            edit
                          </span>
                          Edit Profile
                        </Link>
                      </>
                    )}
                    <Link
                      href="/submit"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-stone-400">
                        edit_calendar
                      </span>
                      Submit New Event
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={isPending}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      {isPending ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-stone-600 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold bg-on-surface text-white hover:bg-on-surface/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
