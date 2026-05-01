"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/auth";

const INPUT =
  "w-full bg-[#f6f3f2] border-none rounded-xl text-sm p-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    {}
  );

  if (state.success === "ok") {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 space-y-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-primary text-3xl">
            mark_email_read
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Check your inbox
          </h1>
          <p className="text-sm text-stone-400 mt-3 leading-relaxed">
            If an account exists for{" "}
            <span className="font-bold text-on-surface">{state.email}</span>,
            we&apos;ve sent a password reset link.
            <br />
            Click the link in that email to choose a new password.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 text-xs text-stone-500 text-left space-y-1.5">
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">
              info
            </span>
            Check your spam/junk folder if you don&apos;t see it.
          </p>
          <p className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">
              schedule
            </span>
            The link expires in 1 hour.
          </p>
        </div>

        <Link
          href="/login"
          className="block text-sm text-stone-400 hover:text-primary transition-colors"
        >
          Remembered it?{" "}
          <span className="font-bold text-primary">Sign in</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              lock_reset
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Forgot password?
          </h1>
          <p className="text-sm text-stone-400 mt-1 leading-relaxed">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {state.error && (
          <div className="bg-error/10 text-error rounded-xl p-3 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">
              error
            </span>
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
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

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {pending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400">
          Remembered it?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
