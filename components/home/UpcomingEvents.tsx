import type { ListEvent } from "@/types";
import EventListItem from "@/components/shared/EventListItem";

interface UpcomingEventsProps {
  events: ListEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="mt-12 md:mt-20">
      <div className="mb-5 md:mb-10">
        <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
          Upcoming Stories
        </h3>
      </div>

      <div className="space-y-3 md:space-y-6">
        {events.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
