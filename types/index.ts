// ─── UI types (used by existing components) ───────────────────────────────────

export interface EventTag {
  label: string;
  /** Tailwind utility classes, e.g. "bg-primary/10 text-primary" */
  color: string;
}

export interface EventOrganizer {
  name: string;
  role: string;
  /** Single uppercase letter shown as avatar fallback */
  initial: string;
}

/** Lightweight shape used in lists and the calendar */
export interface ListEvent {
  id: string;
  day: string;
  month: string;
  tags: EventTag[];
  title: string;
  location: string;
  time: string;
  host: string;
  hostLogo: string;
}

/** Full shape used on the event detail page */
export interface FullEvent extends ListEvent {
  subtitle: string;
  date: string;
  address: string;
  heroImage: string;
  openToCollaboration: boolean;
  rsvpLink: string;
  volunteerLink: string;
  contactLink: string;
  description: string;
  organizer: EventOrganizer;
  coHosts: string[];
  spotsLeft: number;
  totalSpots: number;
  /** ID of the user who submitted this event — used for "View Profile" link */
  submitterId: string | null;
}

export interface CalendarDayEvent {
  slug: string;
  title: string;
  heroImage: string | null;
  /** Tailwind color key: "primary" | "secondary" | "tertiary" */
  accent: string;
  time: string;
  host: string;
}

/** One cell in the 7-column monthly calendar grid */
export interface CalendarCell {
  /** null for padding cells from adjacent months */
  day: number | null;
  /** Display label (may differ from day for padding cells) */
  label: string;
  isPrev?: boolean;
  isNext?: boolean;
  isToday?: boolean;
  events?: CalendarDayEvent[];
}

export interface CalendarMeta {
  month: string;
  year: number;
  eventCount: number;
}

// ─── DB types (map directly to Supabase rows) ─────────────────────────────────

export type EventStatus = "pending" | "approved" | "rejected";

export type CauseArea =
  | "Health"
  | "Education"
  | "Environment"
  | "Food Security"
  | "Housing"
  | "Youth"
  | "Seniors"
  | "Arts & Culture"
  | "Civic Engagement"
  | "Animal Welfare"
  | "Other";

export type EventType =
  | "Workshop"
  | "Gala"
  | "Community"
  | "Networking"
  | "Fundraiser"
  | "Volunteer"
  | "Conference"
  | "Webinar"
  | "Other";

export interface DbEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  hero_image_url: string | null;
  starts_at: string; // ISO string from Supabase
  ends_at: string | null;
  location_name: string;
  address: string | null;
  cause_areas: CauseArea[];
  event_types: EventType[];
  host_org_id: string | null;
  host_name: string;
  host_logo_url: string | null;
  organizer_name: string | null;
  organizer_role: string | null;
  organizer_initial: string | null;
  co_hosts: string[];
  open_to_collaboration: boolean;
  rsvp_link: string | null;
  volunteer_link: string | null;
  contact_link: string | null;
  spots_left: number | null;
  total_spots: number | null;
  status: EventStatus;
  submitted_by_email: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Filter state (URL search params) ─────────────────────────────────────────

export interface EventFilters {
  cause?: CauseArea;
  type?: EventType;
  month?: number; // 1–12
  year?: number;
  location?: string;
  view?: "calendar" | "list";
  sort?: "date_asc" | "date_desc";
}

// ─── Form submission payload ───────────────────────────────────────────────────

export interface EventSubmitPayload {
  title: string;
  subtitle?: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  location_name: string;
  address?: string;
  cause_areas: CauseArea[];
  event_types: EventType[];
  rsvp_link?: string;
  volunteer_link?: string;
  contact_link?: string;
  spots_left?: number;
  total_spots?: number;
  open_to_collaboration: boolean;
  host_name: string;
  organizer_name?: string;
  organizer_role?: string;
  submitted_by_email: string;
  hero_image_url?: string;
}
