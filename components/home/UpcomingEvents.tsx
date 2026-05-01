import type { ListEvent } from "@/types";
import EventListItem from "@/components/shared/EventListItem";

interface UpcomingEventsProps {
  events: ListEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section className="mt-20">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-bold text-on-surface">Upcoming Stories</h3>
        <button className="text-primary font-bold text-sm flex items-center gap-1">
          View All
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
