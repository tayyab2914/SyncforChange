"use client";

import { useEffect, useState, useTransition } from "react";
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
  currentSort: "date_asc" | "date_desc" | "type_asc" | "type_desc";
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
  const [isPending, startTransition] = useTransition();

  // View is purely presentational (calendar vs list). Keep it in client state
  // so the toggle is instant and isn't gated on a server re-render — under PPR
  // a query-only navigation that doesn't change a cache key can serve the
  // previously-rendered dynamic HTML, which made the toggle appear broken in
  // production. URL stays in sync for shareable links.
  const [view, setView] = useState<"calendar" | "list">(currentView);

  useEffect(() => {
    setView(currentView);
  }, [currentView]);

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  function setViewMode(next: "calendar" | "list") {
    setView(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "calendar") params.delete("view");
    else params.set("view", next);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
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
      {/* ─────  Mobile header (< md)  ───── */}
      <div className="md:hidden mb-6 space-y-4">
        {/* Month nav as a single bar with big touch targets */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-2">
          <button
            onClick={prevMonth}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-stone-600 hover:text-primary shadow-sm active:scale-95 transition-all"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex flex-col items-center min-w-0 px-2">
            <span className="text-base font-bold tracking-tight text-[#006c48]">
              {meta.month}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
              {meta.year} · {meta.eventCount} event
              {meta.eventCount !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={nextMonth}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-stone-600 hover:text-primary shadow-sm active:scale-95 transition-all"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* View toggle + sort: full-width segmented row */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-low p-1 rounded-xl flex-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "calendar"
                  ? "bg-white shadow-sm text-primary"
                  : "text-stone-500"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                calendar_month
              </span>
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "list"
                  ? "bg-white shadow-sm text-primary"
                  : "text-stone-500"
              }`}
            >
              <span className="material-symbols-outlined text-base">list</span>
              List
            </button>
          </div>
          {view === "list" && (
            <select
              value={currentSort}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="text-xs border-none bg-surface-container-low rounded-xl px-3 py-2.5 text-stone-700 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            >
              <option value="date_asc">Soonest</option>
              <option value="date_desc">Latest</option>
              <option value="type_asc">Type A–Z</option>
              <option value="type_desc">Type Z–A</option>
            </select>
          )}
        </div>
      </div>

      {/* ─────  Desktop controls row (>= md)  ───── */}
      <div className="hidden md:flex justify-between items-center mb-10 gap-6">
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
          {view === "list" && (
            <select
              value={currentSort}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="text-sm border-none bg-surface-container-low rounded-xl px-3 py-2 text-stone-600 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
            >
              <option value="date_asc">Date: Soonest</option>
              <option value="date_desc">Date: Latest</option>
              <option value="type_asc">Type: A–Z</option>
              <option value="type_desc">Type: Z–A</option>
            </select>
          )}

          <div className="flex bg-surface-container-low p-1.5 rounded-2xl">
            <ViewButton
              icon="calendar_month"
              label="Calendar"
              active={view === "calendar"}
              onClick={() => setViewMode("calendar")}
            />
            <ViewButton
              icon="list"
              label="List"
              active={view === "list"}
              onClick={() => setViewMode("list")}
            />
          </div>
        </div>
      </div>

      {/* Calendar or list — dim while a navigation is in-flight so the user
          can see filter/sort/month changes are being applied. */}
      <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {view === "calendar" ? (
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
      </div>
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
