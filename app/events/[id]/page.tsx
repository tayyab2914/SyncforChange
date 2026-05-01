import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug } from "@/lib/queries/events";
import EventHero from "@/components/event/EventHero";
import EventHeader from "@/components/event/EventHeader";
import EventMetadata from "@/components/event/EventMetadata";
import EventAbout from "@/components/event/EventAbout";
import EventOrganizer from "@/components/event/EventOrganizer";
import EventCoHosts from "@/components/event/EventCoHosts";
import EventCtaSidebar from "@/components/event/EventCtaSidebar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailContent params={params} />
    </Suspense>
  );
}

async function EventDetailContent({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventBySlug(id);

  if (!event) notFound();

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 md:px-8">
      <nav
        className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 uppercase tracking-widest"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          Events
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-bold truncate max-w-[200px] md:max-w-none">
          {event.title.split(":")[0]}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <EventHero
            src={event.heroImage}
            alt={`Hero image for ${event.title}`}
            openToCollaboration={event.openToCollaboration}
          />
          <EventHeader
            tags={event.tags}
            title={event.title}
            subtitle={event.subtitle}
          />
          <EventMetadata
            date={event.date}
            time={event.time}
            location={event.location}
            address={event.address}
          />
          <EventAbout description={event.description} />
          <EventOrganizer organizer={event.organizer} submitterId={event.submitterId} />
          <EventCoHosts coHosts={event.coHosts} />
        </div>

        <div className="lg:col-span-4">
          <EventCtaSidebar
            spotsLeft={event.spotsLeft}
            totalSpots={event.totalSpots}
            openToCollaboration={event.openToCollaboration}
            rsvpLink={event.rsvpLink}
            volunteerLink={event.volunteerLink}
            contactLink={event.contactLink}
          />
        </div>
      </div>
    </main>
  );
}

function EventDetailSkeleton() {
  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 md:px-8 animate-pulse">
      <div className="h-4 w-40 bg-stone-200 rounded-xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[450px] bg-stone-200 rounded-3xl" />
          <div className="h-8 w-2/3 bg-stone-200 rounded-xl" />
          <div className="h-4 w-1/2 bg-stone-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 rounded-xl" />
            <div className="h-3 bg-stone-100 rounded-xl" />
            <div className="h-3 w-4/5 bg-stone-100 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-64 bg-stone-200 rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
