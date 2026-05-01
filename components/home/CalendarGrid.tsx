"use client";

import { useState } from "react";
import Link from "next/link";
import type { CalendarCell, CalendarDayEvent } from "@/types";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const ACCENT_BG: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};
const ACCENT_BG_SOFT: Record<string, string> = {
  primary: "bg-primary/10",
  secondary: "bg-secondary/10",
  tertiary: "bg-tertiary/10",
};
const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};

interface CalendarGridProps {
  cells: CalendarCell[];
}

export default function CalendarGrid({ cells }: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedCell = selectedDay
    ? cells.find((c) => c.day === selectedDay)
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-lowest rounded-3xl p-3 md:p-5 shadow-[0_12px_40px_rgba(27,28,28,0.06)]">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {cells.map((cell, i) => (
            <DayCell
              key={i}
              cell={cell}
              isSelected={cell.day !== null && cell.day === selectedDay}
              onSelect={() => {
                if (cell.day !== null && (cell.events?.length ?? 0) > 0) {
                  setSelectedDay(cell.day === selectedDay ? null : cell.day);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected-day detail panel */}
      {selectedCell && selectedCell.events && selectedCell.events.length > 0 && (
        <SelectedDayPanel
          day={selectedCell.day!}
          events={selectedCell.events}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function DayCell({
  cell,
  isSelected,
  onSelect,
}: {
  cell: CalendarCell;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isGhost = cell.isPrev || cell.isNext;
  const events = cell.events ?? [];
  const hasEvents = events.length > 0;
  const visible = events.slice(0, 2);
  const overflow = events.length - visible.length;

  if (isGhost) {
    return (
      <div className="aspect-square md:aspect-auto md:min-h-[96px] rounded-xl p-2 opacity-30">
        <span className="text-xs text-stone-400">{cell.label}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!hasEvents}
      className={`group relative w-full aspect-square md:aspect-auto md:min-h-[96px] rounded-xl p-1.5 md:p-2 text-left transition-all flex flex-col gap-1 overflow-hidden ${
        isSelected
          ? "bg-primary/10 ring-2 ring-primary"
          : cell.isToday
          ? "bg-primary/5 ring-1 ring-primary/30"
          : hasEvents
          ? "bg-surface-container-low/40 hover:bg-surface-container-low cursor-pointer"
          : "bg-surface-container-low/20 cursor-default"
      }`}
    >
      <span
        className={`text-[11px] md:text-xs font-bold leading-none ${
          cell.isToday ? "text-primary" : "text-stone-500"
        }`}
      >
        {cell.label}
      </span>

      {hasEvents && (
        <div className="flex flex-col gap-0.5 md:gap-1 mt-0.5 md:mt-1 flex-1 min-h-0">
          {visible.map((e) => (
            <EventChip key={e.slug} event={e} />
          ))}
          {overflow > 0 && (
            <span className="text-[9px] md:text-[10px] font-bold text-stone-400 px-1 mt-auto">
              +{overflow} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function EventChip({ event }: { event: CalendarDayEvent }) {
  return (
    <div
      className={`flex items-center gap-1 md:gap-1.5 px-1 md:px-1.5 py-0.5 rounded-md ${ACCENT_BG_SOFT[event.accent]} border-l-2 ${
        event.accent === "primary"
          ? "border-primary"
          : event.accent === "secondary"
          ? "border-secondary"
          : "border-tertiary"
      } min-w-0`}
    >
      {event.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.heroImage}
          alt=""
          className="w-3 h-3 md:w-4 md:h-4 rounded object-cover shrink-0"
        />
      ) : (
        <span
          className={`block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${ACCENT_BG[event.accent]}`}
        />
      )}
      <span
        className={`hidden md:block text-[10px] font-semibold truncate ${ACCENT_TEXT[event.accent]}`}
      >
        {event.title}
      </span>
    </div>
  );
}

function SelectedDayPanel({
  day,
  events,
  onClose,
}: {
  day: number;
  events: CalendarDayEvent[];
  onClose: () => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_12px_40px_rgba(27,28,28,0.06)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">
            Day {day}
          </p>
          <h3 className="text-lg font-bold text-on-surface mt-0.5">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-stone-100"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            className={`flex items-center gap-4 p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors group`}
          >
            {event.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.heroImage}
                alt=""
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center font-black text-lg ${ACCENT_BG_SOFT[event.accent]} ${ACCENT_TEXT[event.accent]}`}
              >
                {event.title[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                {event.title}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5 truncate">
                {event.time} · Hosted by {event.host}
              </p>
            </div>
            <span className="material-symbols-outlined text-stone-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
