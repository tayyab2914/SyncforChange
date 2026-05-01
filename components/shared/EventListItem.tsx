import Link from "next/link";
import type { ListEvent } from "@/types";
import Tag from "@/components/shared/Tag";

interface EventListItemProps {
  event: ListEvent;
}

export default function EventListItem({ event }: EventListItemProps) {
  return (
    <article className="group flex flex-col md:flex-row gap-8 p-8 bg-surface-container-lowest rounded-3xl hover:shadow-[0_12px_40px_rgba(27,28,28,0.06)] transition-all">
      {/* Date badge */}
      <div className="flex flex-col items-center justify-center bg-surface-container-low rounded-2xl w-24 h-24 shrink-0">
        <span className="text-3xl font-black text-on-surface">{event.day}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          {event.month}
        </span>
      </div>

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-2">
          {event.tags.map((tag) => (
            <Tag key={tag.label} label={tag.label} color={tag.color} />
          ))}
        </div>

        <h3 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors truncate">
          {event.title}
        </h3>

        <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {event.location} &bull; {event.time}
        </p>

        <div className="flex items-center gap-3">
          {event.hostLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-6 h-6 rounded-full grayscale opacity-50 object-cover"
              src={event.hostLogo}
              alt={`${event.host} logo`}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
              {event.host[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span className="text-xs font-medium text-stone-400">
            Hosted by {event.host}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col justify-center gap-3 shrink-0">
        <Link
          href={`/events/${event.id}`}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm text-center hover:scale-95 duration-200 transition-transform"
        >
          RSVP
        </Link>
        <button className="bg-surface-container-low text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors">
          Contact
        </button>
      </div>
    </article>
  );
}
