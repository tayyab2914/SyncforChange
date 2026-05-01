import Link from "next/link";
import type { EventOrganizer as OrganizerType } from "@/types";

interface EventOrganizerProps {
  organizer: OrganizerType;
  submitterId?: string | null;
}

export default function EventOrganizer({
  organizer,
  submitterId,
}: EventOrganizerProps) {
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

        {submitterId ? (
          <Link
            href={`/profile/${submitterId}`}
            className="ml-auto text-primary text-sm font-bold border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-1.5"
          >
            View Profile
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
