"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const verify = searchParams.get("verify");
  const reset = searchParams.get("reset");
  const fromSubmit = next.startsWith("/submit");

  const [state, formAction, pending] = useActionState(loginAction, {});

  const verifyMessage =
    verify === "expired"
      ? "Your confirmation link expired. Please sign up again or request a new link."
      : verify === "invalid"
      ? "Invalid confirmation link."
      : verify === "missing"
      ? "Missing confirmation token."
      : null;

  const INPUT =
    "w-full bg-[#f6f3f2] border-none rounded-xl text-sm p-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <div className="w-full max-w-sm">
      {reset === "ok" && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <span
            className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div>
            <p className="text-sm font-bold text-primary">
              Password updated
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              Sign in with your new password.
            </p>
          </div>
        </div>
      )}

      {fromSubmit && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
            edit_calendar
          </span>
          <div>
            <p className="text-sm font-bold text-primary">
              Sign in to submit your event
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              You&apos;ll be taken straight to the submission form after signing in.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              login
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {fromSubmit
              ? "Sign in to continue submitting your event"
              : "Sign in to your organizer account"}
          </p>
        </div>

        {(state.error || verifyMessage) && (
          <div className="bg-error/10 text-error rounded-xl p-3 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {state.error ?? verifyMessage}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@organization.org"
              className={INPUT}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {pending ? "Signing in…" : fromSubmit ? "Sign In & Continue to Submit" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="text-primary font-bold hover:underline"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
