"use client";

import { useEffect, useState } from "react";

interface EventCtaSidebarProps {
  totalSpots: number;
  openToCollaboration: boolean;
  rsvpLink: string;
  volunteerLink: string;
  contactLink: string;
  // New: needed for share / calendar / mailto fallbacks
  eventTitle: string;
  eventSlug: string;
  eventDescription: string;
  startsAtIso: string;
  endsAtIso: string | null;
  locationName: string;
  address: string;
  hostEmail: string;
}

export default function EventCtaSidebar({
  totalSpots,
  openToCollaboration,
  rsvpLink,
  volunteerLink,
  contactLink,
  eventTitle,
  eventSlug,
  eventDescription,
  startsAtIso,
  endsAtIso,
  locationName,
  address,
  hostEmail,
}: EventCtaSidebarProps) {
  const showCapacity = totalSpots > 0;

  return (
    <aside className="sticky top-28 space-y-4">
      {showCapacity && <CapacityCard totalSpots={totalSpots} />}
      <ActionsCard
        rsvpLink={rsvpLink}
        volunteerLink={volunteerLink}
        contactLink={contactLink}
        openToCollaboration={openToCollaboration}
        eventTitle={eventTitle}
        hostEmail={hostEmail}
      />
      <ReminderCard
        title={eventTitle}
        slug={eventSlug}
        description={eventDescription}
        startsAtIso={startsAtIso}
        endsAtIso={endsAtIso}
        location={[locationName, address].filter(Boolean).join(", ")}
      />
      <ShareCard
        title={eventTitle}
        slug={eventSlug}
        description={eventDescription}
      />
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────────
// Capacity (informational only — RSVPs are tracked on external platforms)
// ────────────────────────────────────────────────────────────────────

function CapacityCard({ totalSpots }: { totalSpots: number }) {
  return (
    <div className="p-5 bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(27,28,28,0.06)] flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined">groups</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">
          Capacity
        </p>
        <p className="text-sm font-bold text-on-surface mt-0.5">
          Up to {totalSpots.toLocaleString()} attendee
          {totalSpots !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Actions (RSVP / Volunteer / Co-host / Contact)
// ────────────────────────────────────────────────────────────────────

function ActionsCard({
  rsvpLink,
  volunteerLink,
  contactLink,
  openToCollaboration,
  eventTitle,
  hostEmail,
}: {
  rsvpLink: string;
  volunteerLink: string;
  contactLink: string;
  openToCollaboration: boolean;
  eventTitle: string;
  hostEmail: string;
}) {
  const contactHref =
    contactLink ||
    `mailto:${hostEmail}?subject=${encodeURIComponent(`Question about ${eventTitle}`)}`;

  const cohostHref = `mailto:${hostEmail}?subject=${encodeURIComponent(
    `Co-host interest: ${eventTitle}`
  )}&body=${encodeURIComponent(
    `Hi,\n\nI'd like to co-host "${eventTitle}". Here's a bit about my org and what we could bring:\n\n[your message]\n\nLooking forward to hearing back.`
  )}`;

  // If no actionable links at all, hide the entire card
  if (!rsvpLink && !volunteerLink && !openToCollaboration && !hostEmail && !contactLink) {
    return null;
  }

  return (
    <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(27,28,28,0.06)] space-y-3">
      {rsvpLink ? (
        <a
          href={rsvpLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-sm hover:scale-95 duration-200 transition-transform"
        >
          <span className="material-symbols-outlined text-base">event_available</span>
          RSVP to Attend
        </a>
      ) : (
        <button
          disabled
          title="No registration link provided"
          className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-stone-400 py-3.5 rounded-2xl font-bold text-sm cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base">event_busy</span>
          No Registration Required
        </button>
      )}

      {volunteerLink && (
        <a
          href={volunteerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container py-3.5 rounded-2xl font-bold text-sm hover:scale-95 duration-200 transition-transform"
        >
          <span className="material-symbols-outlined text-base">volunteer_activism</span>
          Volunteer Sign-up
        </a>
      )}

      {openToCollaboration && hostEmail && (
        <a
          href={cohostHref}
          className="w-full flex items-center justify-center gap-2 border-2 border-primary/20 text-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-base">handshake</span>
          Express Co-host Interest
        </a>
      )}

      {(contactLink || hostEmail) && (
        <a
          href={contactHref}
          target={contactLink ? "_blank" : undefined}
          rel={contactLink ? "noopener noreferrer" : undefined}
          className="w-full flex items-center justify-center gap-2 bg-surface-container-low text-on-surface py-3.5 rounded-2xl font-bold text-sm hover:bg-stone-200 transition-colors"
        >
          <span className="material-symbols-outlined text-base">mail</span>
          Contact Host
        </a>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Calendar reminder (.ics + Google Calendar)
// ────────────────────────────────────────────────────────────────────

function ReminderCard({
  title,
  slug,
  description,
  startsAtIso,
  endsAtIso,
  location,
}: {
  title: string;
  slug: string;
  description: string;
  startsAtIso: string;
  endsAtIso: string | null;
  location: string;
}) {
  const [open, setOpen] = useState(false);

  const startDate = new Date(startsAtIso);
  // Default end = start + 2 hours if no end provided
  const endDate = endsAtIso
    ? new Date(endsAtIso)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  function downloadIcs() {
    const ics = buildIcs({
      uid: `${slug}@syncforchange`,
      title,
      description,
      location,
      start: startDate,
      end: endDate,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setOpen(false);
  }

  function googleCalendarUrl() {
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${fmt(startDate)}/${fmt(endDate)}`,
      details: description,
      location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div className="relative">
      <div className="p-5 bg-surface-container-low rounded-3xl flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-2xl">
          notifications
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface">Add to Calendar</p>
          <p className="text-xs text-on-surface-variant">
            Save the date so you don&apos;t forget
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-bold text-primary border border-primary/20 px-4 py-1.5 rounded-xl hover:bg-primary/5 transition-colors"
        >
          {open ? "Close" : "Add"}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-10">
          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-sm font-medium text-on-surface"
          >
            <span className="material-symbols-outlined text-base text-primary">
              calendar_month
            </span>
            Google Calendar
          </a>
          <button
            type="button"
            onClick={downloadIcs}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-sm font-medium text-on-surface text-left"
          >
            <span className="material-symbols-outlined text-base text-primary">
              download
            </span>
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

interface IcsArgs {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}

function buildIcs(args: IcsArgs): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const now = fmt(new Date());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SyncforChange//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${args.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmt(args.start)}`,
    `DTEND:${fmt(args.end)}`,
    `SUMMARY:${escape(args.title)}`,
    `DESCRIPTION:${escape(args.description)}`,
    `LOCATION:${escape(args.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${escape(args.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ────────────────────────────────────────────────────────────────────
// Share
// ────────────────────────────────────────────────────────────────────

function ShareCard({
  title,
  slug,
  description,
}: {
  title: string;
  slug: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setPageUrl(`${window.location.origin}/events/${slug}`);
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, [slug]);

  async function copyLink() {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title,
        text: description.slice(0, 200),
        url: pageUrl,
      });
    } catch {
      // user cancelled or unsupported — silent
    }
  }

  function openTwitter() {
    const u = new URL("https://twitter.com/intent/tweet");
    u.searchParams.set("text", `${title} — `);
    u.searchParams.set("url", pageUrl);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }

  function openFacebook() {
    const u = new URL("https://www.facebook.com/sharer/sharer.php");
    u.searchParams.set("u", pageUrl);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }

  function openWhatsapp() {
    const text = encodeURIComponent(`${title}\n${pageUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="p-5 bg-surface-container-low rounded-3xl">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
        Share this event
      </p>
      <div className="grid grid-cols-4 gap-2">
        <ShareButton
          icon={copied ? "check" : "link"}
          label={copied ? "Copied!" : "Copy link"}
          onClick={copyLink}
          highlighted={copied}
        />
        <ShareButton icon="public" label="X (Twitter)" onClick={openTwitter} />
        <ShareButton icon="thumb_up" label="Facebook" onClick={openFacebook} />
        <ShareButton icon="chat" label="WhatsApp" onClick={openWhatsapp} />
      </div>
      {canNativeShare && (
        <button
          onClick={nativeShare}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-primary py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">ios_share</span>
          More share options
        </button>
      )}
    </div>
  );
}

function ShareButton({
  icon,
  label,
  onClick,
  highlighted,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-colors ${
        highlighted
          ? "bg-primary/10 text-primary"
          : "bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/5"
      }`}
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
      <span className="text-[9px] font-bold leading-none">{label}</span>
    </button>
  );
}
