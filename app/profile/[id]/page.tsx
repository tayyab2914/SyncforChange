import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  return (
    <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 md:px-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent params={params} />
      </Suspense>
    </main>
  );
}

async function ProfileContent({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      events: {
        where: { status: "approved" },
        orderBy: { startsAt: "desc" },
        take: 12,
      },
    },
  });

  if (!user || !user.profileCompleted) notFound();

  return (
    <div className="space-y-12">
      {/* Profile header */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Avatar */}
        <div className="md:col-span-3 flex justify-center md:justify-start">
          <div className="w-40 h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
            {user.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt={`${user.displayName} profile picture`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary text-6xl font-black">
                {user.displayName?.[0]?.toUpperCase() ?? "O"}
              </span>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="md:col-span-9">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
            {user.organizationType}
          </span>
          <h1 className="text-4xl font-bold text-on-surface mt-3 tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-stone-500 mt-2 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-base">place</span>
            {user.location}
          </p>

          {user.bio && (
            <p className="text-on-surface-variant mt-5 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Cause focus pills */}
          {user.causeFocus.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {user.causeFocus.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-tertiary/10 text-tertiary"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full text-sm font-bold text-stone-600 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">link</span>
                Website
              </a>
            )}
            <a
              href={`mailto:${user.email}`}
              className="inline-flex items-center gap-2 bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full text-sm font-bold text-stone-600 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* Events section */}
      <section>
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">
            Events by {user.displayName}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {user.events.length === 0
              ? "No published events yet."
              : `${user.events.length} approved event${user.events.length !== 1 ? "s" : ""}`}
          </p>
        </header>

        {user.events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {user.events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group block bg-surface-container-lowest rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(27,28,28,0.08)] transition-shadow"
              >
                <div className="aspect-[5/3] bg-gradient-to-br from-primary/10 to-tertiary/10 overflow-hidden">
                  {event.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.heroImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-primary/40 text-5xl font-black">
                        {event.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    {format(event.startsAt, "MMM d, yyyy")}
                  </p>
                  <h3 className="text-base font-bold text-on-surface mt-1 group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1.5 truncate">
                    {event.locationName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-3 flex justify-center md:justify-start">
          <div className="w-40 h-40 bg-stone-200 rounded-3xl" />
        </div>
        <div className="md:col-span-9 space-y-4">
          <div className="h-5 w-32 bg-stone-200 rounded-full" />
          <div className="h-9 w-2/3 bg-stone-200 rounded-xl" />
          <div className="h-4 w-1/3 bg-stone-100 rounded-xl" />
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-stone-100 rounded-xl" />
            <div className="h-3 bg-stone-100 rounded-xl" />
            <div className="h-3 w-4/5 bg-stone-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
