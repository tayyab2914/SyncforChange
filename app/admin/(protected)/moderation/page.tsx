import { Suspense } from "react";
import { getAllEventsForAdmin, getAdminStats } from "@/lib/queries/events";
import ModerationTable from "@/components/admin/ModerationTable";

export default function ModerationPage() {
  return (
    <main className="pt-24 md:pt-28 pb-24 md:pb-12 px-4 md:px-6 lg:mr-8 max-w-7xl mx-auto">
      <header className="mb-8 md:mb-10">
        <span className="text-primary font-bold tracking-widest text-[0.7rem] md:text-[0.75rem] uppercase block mb-2">
          Management Console
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
          Event Moderation
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl leading-relaxed text-sm md:text-base">
          Review and manage community-submitted events. Ensure consistency with
          our editorial standards before publication.
        </p>
      </header>

      <Suspense fallback={<ModerationSkeleton />}>
        <ModerationContent />
      </Suspense>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 p-8 bg-primary text-white rounded-3xl relative overflow-hidden flex flex-col justify-end min-h-[260px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary-container opacity-90" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">
              Need help deciding?
            </h2>
            <p className="text-primary-fixed max-w-xl text-base leading-relaxed mb-5 opacity-90">
              Review our community standards guidelines for clarity on
              commercial vs. community-led events. When in doubt, prioritize
              local impact.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-95 transition-transform">
              Read Guidelines
            </button>
          </div>
        </div>

        <div className="md:col-span-1 p-6 bg-surface-container-highest rounded-3xl">
          <h4 className="font-bold text-sm uppercase tracking-widest text-primary mb-4">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {["View Calendar", "Submit Page", "Admin Login", "Settings"].map(
              (link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-stone-600 hover:text-secondary font-medium transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}

async function ModerationContent() {
  const [events, stats] = await Promise.all([
    getAllEventsForAdmin(),
    getAdminStats(),
  ]);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon="pending_actions"
          iconColor="text-primary"
          iconBg="bg-primary/10"
          value={stats.pending}
          label="Pending Approval"
          badge={stats.pending > 0 ? `+${stats.pending} New` : undefined}
        />
        <StatCard
          icon="verified"
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
          value={stats.approved}
          label="Total Approved"
        />
        <StatCard
          icon="group"
          iconColor="text-tertiary"
          iconBg="bg-tertiary/10"
          value={stats.organizers}
          label="Active Organizers"
        />
      </section>
      <ModerationTable events={events} />
    </>
  );
}

function ModerationSkeleton() {
  return (
    <div className="animate-pulse space-y-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-3xl" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded-3xl" />
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBg,
  value,
  label,
  badge,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  value: number;
  label: string;
  badge?: string;
}) {
  return (
    <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(27,28,28,0.06)]">
      <div className="flex justify-between items-start mb-4">
        <span className={`p-3 ${iconBg} ${iconColor} rounded-2xl`}>
          <span className="material-symbols-outlined">{icon}</span>
        </span>
        {badge && (
          <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-full uppercase tracking-tighter">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-on-surface">
        {value.toLocaleString()}
      </h3>
      <p className="text-sm font-bold uppercase tracking-widest text-stone-500 mt-1">
        {label}
      </p>
    </div>
  );
}
