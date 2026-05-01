import {
  endOfMonth,
  getDay,
  getDaysInMonth,
  isToday,
  format,
  addDays,
  subDays,
} from "date-fns";
import type { CalendarCell, CalendarMeta, CalendarDayEvent } from "@/types";

export function buildCalendarCells(
  year: number,
  month: number,
  eventsByDay: Map<number, CalendarDayEvent[]>
): CalendarCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = endOfMonth(firstDay);
  const totalDays = getDaysInMonth(firstDay);
  const startDow = getDay(firstDay);

  const cells: CalendarCell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = subDays(firstDay, i + 1);
    cells.push({ day: null, label: format(d, "d"), isPrev: true });
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d);
    cells.push({
      day: d,
      label: String(d),
      isToday: isToday(date),
      events: eventsByDay.get(d) ?? [],
    });
  }

  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= remaining; i++) {
    const d = addDays(lastDay, i);
    cells.push({ day: null, label: format(d, "d"), isNext: true });
  }

  return cells;
}

export function buildCalendarMeta(
  year: number,
  month: number,
  eventCount: number
): CalendarMeta {
  const date = new Date(year, month - 1, 1);
  return {
    month: format(date, "MMMM"),
    year,
    eventCount,
  };
}
