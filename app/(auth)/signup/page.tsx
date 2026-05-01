"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signupAction } from "@/actions/auth";
import { useEffect } from "react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/submit";

  const [state, formAction, pending] = useActionState(signupAction, {});

  useEffect(() => {
    if (state.success === "ok" && state.email) {
      router.push(`/verify?email=${encodeURIComponent(state.email)}`);
    }
  }, [state, router]);

  const INPUT =
    "w-full bg-[#f6f3f2] border-none rounded-xl text-sm p-3.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all";

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              person_add
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Create Organizer Account
          </h1>
          <p className="text-sm text-stone-400 mt-1 leading-relaxed">
            Register to submit events to the Living Journal calendar
          </p>
        </div>

        {state.error && (
          <div className="bg-error/10 text-error rounded-xl p-3 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {state.error}
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
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
              Password
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

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {pending ? "Creating account…" : "Create Account & Verify Email"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-primary font-bold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
        We&apos;ll send a confirmation link to verify your email. No spam, ever.
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
