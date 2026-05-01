"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CalendarCell, CalendarMeta, ListEvent } from "@/types";
import CalendarGrid from "@/components/home/CalendarGrid";
import EventListItem from "@/components/shared/EventListItem";

interface CalendarSectionProps {
  meta: CalendarMeta;
  cells: CalendarCell[];
  events: ListEvent[];
  currentMonth: number;
  currentYear: number;
  currentView: "calendar" | "list";
  currentSort: "date_asc" | "date_desc";
}

export default function CalendarSection({
  meta,
  cells,
  events,
  currentMonth,
  currentYear,
  currentView,
  currentSort,
}: CalendarSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/?${params.toString()}`);
  }

  function prevMonth() {
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 1) { m = 12; y -= 1; }
    navigate({ month: String(m), year: String(y) });
  }

  function nextMonth() {
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 12) { m = 1; y += 1; }
    navigate({ month: String(m), year: String(y) });
  }

  return (
    <section>
      {/* Controls row */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={prevMonth}
              className="text-stone-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-[#006c48]">
              {meta.month} {meta.year}
            </h2>
            <button
              onClick={nextMonth}
              className="text-stone-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
          <p className="text-stone-500 text-sm">
            {meta.eventCount} event{meta.eventCount !== 1 ? "s" : ""} this month
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentView === "list" && (
            <select
              value={currentSort}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="text-sm border-none bg-surface-container-low rounded-xl px-3 py-2 text-stone-600 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            >
              <option value="date_asc">Date: Soonest</option>
              <option value="date_desc">Date: Latest</option>
            </select>
          )}

          <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
            <ViewButton
              icon="calendar_month"
              label="Calendar"
              active={currentView === "calendar"}
              onClick={() => navigate({ view: "calendar" })}
            />
            <ViewButton
              icon="list"
              label="List"
              active={currentView === "list"}
              onClick={() => navigate({ view: "list" })}
            />
          </div>
        </div>
      </div>

      {/* Calendar or list */}
      {currentView === "calendar" ? (
        <CalendarGrid cells={cells} />
      ) : (
        <div className="space-y-6">
          {events.length === 0 ? (
            <p className="text-stone-400 text-center py-16">
              No events found for this period.
            </p>
          ) : (
            events.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

interface ViewButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ViewButton({ icon, label, active, onClick }: ViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active
          ? "bg-white shadow-sm text-primary"
          : "text-stone-500 hover:text-primary"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
  );
}
