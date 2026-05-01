"use client";

import { useEffect, useState } from "react";

const REASONS = [
  { value: "outdated", label: "Outdated or already happened" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "inaccurate", label: "Inaccurate information" },
  { value: "spam", label: "Spam or promotional only" },
  { value: "other", label: "Something else" },
] as const;

interface Props {
  eventSlug: string;
}

export default function ReportEventButton({ eventSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("outdated");
  const [message, setMessage] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventSlug}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, message, reporterEmail }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Failed to submit report.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setDone(false);
      setMessage("");
      setReporterEmail("");
      setReason("outdated");
      setError("");
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-error transition-colors px-3 py-1.5 rounded-full hover:bg-error/5"
      >
        <span className="material-symbols-outlined text-sm">flag</span>
        Report this event
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
            onClick={close}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface">
                Report this event
              </h2>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-stone-100"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-stone-500">
                  close
                </span>
              </button>
            </div>

            {done ? (
              <div className="px-6 py-10 text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <h3 className="text-base font-bold">Thanks for the report</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Our moderation team will review this event. We don&apos;t
                  follow up unless we have questions.
                </p>
                <button
                  onClick={close}
                  className="mt-3 px-5 py-2 rounded-full bg-primary text-white text-xs font-bold hover:scale-95 transition-transform"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 py-5 space-y-4">
                <p className="text-xs text-stone-500 leading-relaxed">
                  Help keep the community calendar accurate. Choose a reason
                  and add details if helpful — we&apos;ll review every report.
                </p>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">
                    Reason
                  </label>
                  <div className="space-y-1.5">
                    {REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          reason === r.value
                            ? "border-primary bg-primary/5"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium text-on-surface">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">
                    Details{" "}
                    <span className="text-stone-300 normal-case font-normal tracking-normal">
                      optional
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    placeholder="Anything specific our team should know?"
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">
                    Your email{" "}
                    <span className="text-stone-300 normal-case font-normal tracking-normal">
                      optional
                    </span>
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="So we can follow up if needed"
                    className="w-full bg-surface-container-low border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-error font-medium">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:scale-95 transition-transform disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
