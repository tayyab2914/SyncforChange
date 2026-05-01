import Link from "next/link";
import type { ListEvent } from "@/types";
import Tag from "@/components/shared/Tag";

interface EventListItemProps {
  event: ListEvent;
}

export default function EventListItem({ event }: EventListItemProps) {
  return (
    <>
      {/* ─────  Mobile card (< md) — single tappable row  ───── */}
      <Link
        href={`/events/${event.id}`}
        className="md:hidden block group bg-surface-container-lowest rounded-2xl p-4 active:scale-[0.99] transition-transform shadow-sm"
      >
        <div className="flex items-stretch gap-3">
          {/* Date pill on the left */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-xl w-14 shrink-0 py-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              {event.month}
            </span>
            <span className="text-2xl font-black text-on-surface leading-none mt-0.5">
              {event.day}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Tags + chevron row */}
            <div className="flex items-center gap-1.5 mb-1">
              {event.tags.slice(0, 2).map((tag) => (
                <Tag key={tag.label} label={tag.label} color={tag.color} />
              ))}
            </div>

            <h3 className="text-sm font-bold text-on-surface leading-snug line-clamp-2 group-active:text-primary transition-colors">
              {event.title}
            </h3>

            <p className="text-[11px] text-stone-500 mt-1 truncate flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">place</span>
              {event.location}
              <span className="text-stone-300 mx-0.5">·</span>
              <span className="material-symbols-outlined text-xs">schedule</span>
              {event.time}
            </p>
          </div>

          {/* Chevron */}
          <div className="flex items-center text-stone-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </div>
        </div>
      </Link>

      {/* ─────  Desktop card (>= md) — fully clickable  ───── */}
      <Link
        href={`/events/${event.id}`}
        className="hidden md:flex group flex-col md:flex-row gap-4 md:gap-8 p-5 md:p-8 bg-surface-container-lowest rounded-3xl hover:shadow-[0_12px_40px_rgba(27,28,28,0.06)] transition-all"
      >
        {/* Date badge */}
        <div className="flex flex-col items-center justify-center bg-surface-container-low rounded-2xl w-20 h-20 md:w-24 md:h-24 shrink-0">
          <span className="text-2xl md:text-3xl font-black text-on-surface">
            {event.day}
          </span>
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

          <h3 className="text-lg md:text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
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

        {/* Action indicator */}
        <div className="flex flex-col justify-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm group-hover:scale-95 duration-200 transition-transform">
            View Event
            <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </span>
        </div>
      </Link>
    </>
  );
}
