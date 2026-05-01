"use client";

import { Suspense, useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/actions/auth";

const INPUT =
  "w-full bg-[#f6f3f2] border-none rounded-xl text-sm p-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  useEffect(() => {
    if (state.success) {
      // Bounce to login after a moment so the user sees the success state
      const t = setTimeout(() => router.push("/login?reset=ok"), 1500);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  // No token at all — bad link
  if (!token) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-error text-3xl">
            error
          </span>
        </div>
        <h1 className="text-xl font-bold text-on-surface">Invalid reset link</h1>
        <p className="text-sm text-stone-500">
          This link is missing a token. Request a new one below.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-95 transition-transform"
        >
          Request reset link
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Password updated!</h1>
        <p className="text-sm text-stone-500">
          Taking you to sign in…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              key
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Choose a new password
          </h1>
          <p className="text-sm text-stone-400 mt-1 leading-relaxed">
            Pick something at least 8 characters long.
          </p>
        </div>

        {state.error && (
          <div className="bg-error/10 text-error rounded-xl p-3 text-sm font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
              error
            </span>
            <div>
              {state.error}
              {/expired|invalid|used/i.test(state.error) && (
                <div className="mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-primary font-bold underline"
                  >
                    Request a new link
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              minLength={8}
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm"
              required
              autoComplete="new-password"
              placeholder="Re-enter new password"
              minLength={8}
              className={INPUT}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {pending ? "Updating…" : "Update Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
