import Link from "next/link";
import type {
  EventOrganizer as OrganizerType,
  EventOrganizerProfile,
} from "@/types";

interface EventOrganizerProps {
  organizer: OrganizerType;
  submitterId?: string | null;
  profile?: EventOrganizerProfile | null;
}

export default function EventOrganizer({
  organizer,
  submitterId,
  profile,
}: EventOrganizerProps) {
  // Rich card when we have a complete organizer profile
  if (profile) {
    return (
      <div className="rounded-3xl mb-8 overflow-hidden bg-gradient-to-br from-primary/5 via-white to-tertiary/5 border border-stone-100 shadow-[0_12px_40px_rgba(27,28,28,0.04)]">
        {/* Header band */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 flex items-start justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Organized by
          </span>
          <Link
            href={`/profile/${profile.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            View full profile
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Identity */}
        <div className="px-6 md:px-8 flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center shrink-0 shadow-md">
            {profile.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profileImageUrl}
                alt={`${profile.displayName} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary text-3xl sm:text-4xl font-black">
                {profile.displayName[0]?.toUpperCase() ?? "O"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              {profile.displayName}
            </h3>
            {profile.organizationType && (
              <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {profile.organizationType}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-3">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">place</span>
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                Joined {profile.memberSince}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">event_available</span>
                {profile.totalEvents}{" "}
                {profile.totalEvents === 1 ? "event" : "events"} hosted
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="px-6 md:px-8 mt-5">
            <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Cause focus pills */}
        {profile.causeFocus.length > 0 && (
          <div className="px-6 md:px-8 mt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400 mb-2">
              Cause Focus
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.causeFocus.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-tertiary/10 text-tertiary"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact links */}
        <div className="px-6 md:px-8 py-5 mt-5 border-t border-stone-100 bg-white/40 flex flex-wrap gap-2">
          <Link
            href={`/profile/${profile.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-primary text-white hover:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-base">person</span>
            Profile
          </Link>
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:border-primary/30 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">link</span>
              Website
            </a>
          )}
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:border-primary/30 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Contact
          </a>
        </div>
      </div>
    );
  }

  // Fallback simple card when organizer hasn't completed their profile
  return (
    <div className="p-8 bg-surface-container-low rounded-3xl mb-8">
      <h3 className="text-lg font-bold text-on-surface mb-6">Organized by</h3>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shrink-0">
          {organizer.initial}
        </div>

        <div className="min-w-0">
          <p className="font-bold text-on-surface truncate">{organizer.name}</p>
          <p className="text-sm text-on-surface-variant">{organizer.role}</p>
        </div>

        {submitterId && (
          <Link
            href={`/profile/${submitterId}`}
            className="ml-auto text-primary text-sm font-bold border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-1.5"
          >
            View Profile
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        )}
      </div>
    </div>
  );
}
