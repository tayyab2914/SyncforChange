"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resendVerificationAction } from "@/actions/auth";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [state, formAction, pending] = useActionState(resendVerificationAction, {});

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 space-y-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-primary text-3xl">
          mark_email_read
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">
          Check Your Inbox
        </h1>
        <p className="text-sm text-stone-400 mt-3 leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-bold text-on-surface">{email}</span>.
          <br />
          Click the link in that email to complete your sign-up.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-2xl p-4 text-xs text-stone-500 text-left space-y-1.5">
        <p className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary">info</span>
          Check your spam/junk folder if you don&apos;t see it.
        </p>
        <p className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-primary">schedule</span>
          The link expires in 1 hour.
        </p>
      </div>

      {state.error && (
        <div className="bg-error/10 text-error rounded-xl p-3 text-xs font-medium">
          {state.error}
        </div>
      )}

      {state.success === "ok" && (
        <div className="bg-primary/10 text-primary rounded-xl p-3 text-xs font-medium">
          New confirmation link sent.
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending || !email}
          className="w-full bg-primary/10 text-primary rounded-xl py-3 text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {pending ? "Sending…" : "Resend confirmation link"}
        </button>
      </form>

      <Link
        href="/login"
        className="block text-sm text-stone-400 hover:text-primary transition-colors"
      >
        Already confirmed?{" "}
        <span className="font-bold text-primary">Sign in</span>
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
