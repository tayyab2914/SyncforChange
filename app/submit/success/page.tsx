import Link from "next/link";

const STEPS = [
  {
    icon: "upload_file",
    label: "Submitted",
    desc: "Your event has been received",
    done: true,
  },
  {
    icon: "manage_search",
    label: "Under Review",
    desc: "Our team is reviewing for community standards",
    done: false,
    active: true,
  },
  {
    icon: "calendar_month",
    label: "Published",
    desc: "Visible to the community on the calendar",
    done: false,
  },
];

export default function SubmitSuccessPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-3">
          Event Submitted!
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed max-w-md mx-auto">
          Thank you for sharing with the community. Our editorial team will
          review your submission and publish it within{" "}
          <span className="font-bold text-on-surface">24–48 hours</span>.
        </p>
      </div>

      {/* Review timeline */}
      <div className="bg-surface-container-low rounded-3xl p-8 mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">
          What happens next
        </h2>
        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start gap-4">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? "bg-primary text-white"
                      : step.active
                      ? "bg-primary/10 text-primary border-2 border-primary/30"
                      : "bg-stone-100 text-stone-300"
                  }`}
                >
                  {step.done ? (
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">
                      {step.icon}
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-1 ${
                      step.done ? "bg-primary/30" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>

              <div className="pt-1.5">
                <p
                  className={`font-bold text-sm ${
                    step.done
                      ? "text-primary"
                      : step.active
                      ? "text-on-surface"
                      : "text-stone-400"
                  }`}
                >
                  {step.label}
                  {step.active && (
                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      In progress
                    </span>
                  )}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin note */}
      <div className="flex items-start gap-3 bg-primary/5 rounded-2xl p-4 mb-8">
        <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">
          info
        </span>
        <p className="text-sm text-stone-500 leading-relaxed">
          Once approved by our moderation team, your event will automatically
          appear on the public calendar and in community listings.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          View Calendar
        </Link>
        <Link
          href="/submit"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary/10 text-primary rounded-2xl font-bold text-sm hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Submit Another Event
        </Link>
      </div>
    </main>
  );
}
