import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Hero from "@/components/home/Hero";
import CalendarSection from "@/components/home/CalendarSection";
import CommunitySpotlight from "@/components/home/CommunitySpotlight";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import {
  getApprovedEvents,
  getEventsForCalendarMonth,
  getEventCount,
} from "@/lib/queries/events";
import {
  buildCalendarCells,
  buildCalendarMeta,
} from "@/lib/utils/calendar";
import type { EventFilters, CauseArea, EventType } from "@/types";

type RawParams = {
  cause?: string;
  type?: string;
  month?: string;
  year?: string;
  view?: string;
  sort?: string;
  location?: string;
};

interface PageProps {
  searchParams: Promise<RawParams>;
}

// The outer page renders the static shell immediately.
// CalendarContent reads searchParams (a runtime API) inside <Suspense>
// so Next.js can stream it without blocking the shell.
export default function HomePage({ searchParams }: PageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main className="pt-24 pb-20 lg:ml-64 px-4 md:px-8 max-w-7xl mx-auto">
        <Hero />
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarContent searchParams={searchParams} />
        </Suspense>
        <CommunitySpotlight />
      </main>
    </>
  );
}

async function CalendarContent({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const filters: EventFilters = {
    cause: params.cause as CauseArea | undefined,
    type: params.type as EventType | undefined,
    month,
    year,
    location: params.location,
    sort: params.sort as "date_asc" | "date_desc" | undefined,
  };

  const [events, eventDays, eventCount] = await Promise.all([
    getApprovedEvents(filters),
    getEventsForCalendarMonth(year, month),
    getEventCount(year, month),
  ]);

  const cells = buildCalendarCells(year, month, eventDays);
  const meta = buildCalendarMeta(year, month, eventCount);

  return (
    <>
      <CalendarSection
        meta={meta}
        cells={cells}
        events={events}
        currentMonth={month}
        currentYear={year}
        currentView={(params.view as "calendar" | "list") ?? "calendar"}
        currentSort={(params.sort as "date_asc" | "date_desc") ?? "date_asc"}
      />
      <UpcomingEvents events={events} />
    </>
  );
}

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-stone-200 rounded-xl" />
          <div className="h-4 w-36 bg-stone-100 rounded-xl" />
        </div>
        <div className="h-10 w-48 bg-stone-200 rounded-2xl" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square bg-stone-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
