const SHARE_ACTIONS = [
  { icon: "link", label: "Copy link" },
  { icon: "facebook", label: "Facebook" },
  { icon: "share", label: "Twitter / X" },
] as const;

interface EventCtaSidebarProps {
  spotsLeft: number;
  totalSpots: number;
  openToCollaboration: boolean;
  rsvpLink: string;
  volunteerLink: string;
  contactLink: string;
}

export default function EventCtaSidebar({
  spotsLeft,
  totalSpots,
  openToCollaboration,
  rsvpLink,
  volunteerLink,
  contactLink,
}: EventCtaSidebarProps) {
  const spotsFilled = totalSpots - spotsLeft;
  const fillPercent = Math.round((spotsFilled / totalSpots) * 100);

  return (
    <aside className="sticky top-28 space-y-4">
      <SpotsCard
        spotsLeft={spotsLeft}
        totalSpots={totalSpots}
        spotsFilled={spotsFilled}
        fillPercent={fillPercent}
      />
      <ActionsCard
        rsvpLink={rsvpLink}
        volunteerLink={volunteerLink}
        contactLink={contactLink}
        openToCollaboration={openToCollaboration}
      />
      <ReminderCard />
      <ShareCard />
    </aside>
  );
}

function SpotsCard({
  spotsLeft,
  totalSpots,
  spotsFilled,
  fillPercent,
}: {
  spotsLeft: number;
  totalSpots: number;
  spotsFilled: number;
  fillPercent: number;
}) {
  return (
    <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(27,28,28,0.06)]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
          Spots Available
        </span>
        <span className="text-sm font-black text-primary">{spotsLeft} left</span>
      </div>
      <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <p className="text-xs text-stone-400">
        {spotsFilled} of {totalSpots} spots filled
      </p>
    </div>
  );
}

function ActionsCard({
  rsvpLink,
  volunteerLink,
  contactLink,
  openToCollaboration,
}: {
  rsvpLink: string;
  volunteerLink: string;
  contactLink: string;
  openToCollaboration: boolean;
}) {
  return (
    <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(27,28,28,0.06)] space-y-3">
      <a
        href={rsvpLink}
        className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-sm hover:scale-95 duration-200 transition-transform"
      >
        <span className="material-symbols-outlined text-sm">event_available</span>
        RSVP to Attend
      </a>

      <a
        href={volunteerLink}
        className="w-full flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container py-3.5 rounded-2xl font-bold text-sm hover:scale-95 duration-200 transition-transform"
      >
        <span className="material-symbols-outlined text-sm">volunteer_activism</span>
        Volunteer Sign-up
      </a>

      {openToCollaboration && (
        <button className="w-full flex items-center justify-center gap-2 border-2 border-primary/20 text-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/5 transition-colors">
          <span className="material-symbols-outlined text-sm">handshake</span>
          Express Co-host Interest
        </button>
      )}

      <a
        href={contactLink}
        className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface py-3.5 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">mail</span>
        Contact Host
      </a>
    </div>
  );
}

function ReminderCard() {
  return (
    <div className="p-6 bg-surface-container-low rounded-3xl flex items-center gap-4">
      <span className="material-symbols-outlined text-primary text-2xl">
        notifications
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-on-surface">Set a Reminder</p>
        <p className="text-xs text-on-surface-variant">
          Get notified before the event starts
        </p>
      </div>
      <button className="text-xs font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors">
        Add
      </button>
    </div>
  );
}

function ShareCard() {
  return (
    <div className="p-6 bg-surface-container-low rounded-3xl">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
        Share this event
      </p>
      <div className="flex gap-3">
        {SHARE_ACTIONS.map(({ icon, label }) => (
          <button
            key={icon}
            title={label}
            className="p-3 bg-surface-container rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
