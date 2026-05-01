"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  const INPUT =
    "w-full bg-[#f6f3f2] border-none rounded-xl text-sm p-3.5 focus:ring-2 focus:ring-primary/20 outline-none";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f3f2] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Admin Access
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Sign in with your admin credentials.
          </p>
        </div>

        {state.error && (
          <div className="bg-error/10 text-error rounded-xl p-3 text-sm font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value="/admin/moderation" />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="admin@organization.org"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={INPUT}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-transform disabled:opacity-60 disabled:scale-100"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
