import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { cacheTag, cacheLife } from "next/cache";
import { prisma } from "@/lib/db";
import type { Event as PrismaEvent } from "@prisma/client";
import type {
  DbEvent,
  ListEvent,
  FullEvent,
  EventFilters,
  EventTag,
  CauseArea,
  EventType,
  CalendarDayEvent,
  AdminEvent,
  AdminEventSubmitter,
} from "@/types";

// ─── Tag color mapping ─────────────────────────────────────────────────────────

const CAUSE_COLORS: Record<string, string> = {
  Health: "bg-secondary/10 text-secondary",
  Education: "bg-primary/10 text-primary",
  Environment: "bg-tertiary/10 text-tertiary",
  "Food Security": "bg-secondary/10 text-secondary",
  Housing: "bg-primary/10 text-primary",
  Youth: "bg-primary/10 text-primary",
  Seniors: "bg-secondary/10 text-secondary",
  "Arts & Culture": "bg-tertiary/10 text-tertiary",
  "Civic Engagement": "bg-primary/10 text-primary",
  "Animal Welfare": "bg-tertiary/10 text-tertiary",
  Other: "bg-primary/10 text-primary",
};

const TYPE_COLORS: Record<string, string> = {
  Workshop: "bg-tertiary/10 text-tertiary",
  Gala: "bg-secondary/10 text-secondary",
  Community: "bg-primary/10 text-primary",
  Networking: "bg-secondary/10 text-secondary",
  Fundraiser: "bg-secondary/10 text-secondary",
  Volunteer: "bg-primary/10 text-primary",
  Conference: "bg-tertiary/10 text-tertiary",
  Webinar: "bg-tertiary/10 text-tertiary",
  Other: "bg-primary/10 text-primary",
};

const CAUSE_DOT_INDEX: Record<string, number> = {
  Health: 1,
  Education: 0,
  Environment: 2,
  "Food Security": 1,
  Housing: 0,
  Youth: 0,
  Seniors: 1,
  "Arts & Culture": 2,
  "Civic Engagement": 0,
  "Animal Welfare": 2,
  Other: 0,
};

function mapToTags(causeAreas: string[], eventTypes: string[]): EventTag[] {
  const tags: EventTag[] = [];
  causeAreas.slice(0, 2).forEach((c) =>
    tags.push({ label: c, color: CAUSE_COLORS[c] ?? "bg-primary/10 text-primary" })
  );
  eventTypes.slice(0, 1).forEach((t) =>
    tags.push({ label: t, color: TYPE_COLORS[t] ?? "bg-primary/10 text-primary" })
  );
  return tags;
}

function toDbEvent(row: PrismaEvent): DbEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    hero_image_url: row.heroImageUrl,
    starts_at: row.startsAt.toISOString(),
    ends_at: row.endsAt?.toISOString() ?? null,
    location_name: row.locationName,
    address: row.address,
    cause_areas: row.causeAreas as CauseArea[],
    event_types: row.eventTypes as EventType[],
    host_org_id: row.hostOrgId,
    host_name: row.hostName,
    host_logo_url: row.hostLogoUrl,
    organizer_name: row.organizerName,
    organizer_role: row.organizerRole,
    organizer_initial: row.organizerInitial,
    co_hosts: row.coHosts,
    open_to_collaboration: row.openToCollaboration,
    rsvp_link: row.rsvpLink,
    volunteer_link: row.volunteerLink,
    contact_link: row.contactLink,
    spots_left: row.spotsLeft,
    total_spots: row.totalSpots,
    status: row.status,
    submitted_by_email: row.submittedByEmail,
    reviewed_by: row.reviewedBy,
    reviewed_at: row.reviewedAt?.toISOString() ?? null,
    rejection_reason: row.rejectionReason,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

function mapToListEvent(row: PrismaEvent): ListEvent {
  const date = row.startsAt;
  return {
    id: row.slug,
    day: format(date, "d"),
    month: format(date, "MMM"),
    tags: mapToTags(row.causeAreas, row.eventTypes),
    title: row.title,
    location: row.locationName,
    time: format(date, "h:mm a"),
    host: row.hostName,
    hostLogo: row.hostLogoUrl ?? "",
  };
}

function mapToFullEvent(row: PrismaEvent): FullEvent {
  const date = row.startsAt;
  return {
    ...mapToListEvent(row),
    subtitle: row.subtitle ?? "",
    date: format(date, "EEEE, MMMM d, yyyy"),
    address: row.address ?? "",
    heroImage: row.heroImageUrl ?? "",
    openToCollaboration: row.openToCollaboration,
    rsvpLink: row.rsvpLink ?? "",
    volunteerLink: row.volunteerLink ?? "",
    contactLink: row.contactLink ?? "",
    description: row.description ?? "",
    organizer: {
      name: row.organizerName ?? row.hostName,
      role: row.organizerRole ?? "Event Organizer",
      initial: (row.organizerInitial ?? row.hostName[0] ?? "O").toUpperCase(),
    },
    coHosts: row.coHosts,
    spotsLeft: row.spotsLeft ?? 0,
    totalSpots: row.totalSpots ?? 0,
    submitterId: row.submittedById,
    submitterEmail: row.submittedByEmail,
    startsAtIso: row.startsAt.toISOString(),
    endsAtIso: row.endsAt?.toISOString() ?? null,
    organizerProfile: null,
  };
}

// ─── Public queries ────────────────────────────────────────────────────────────

export async function getApprovedEvents(
  filters: EventFilters = {}
): Promise<ListEvent[]> {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");

  const where: Parameters<typeof prisma.event.findMany>[0] extends infer T
    ? T extends { where?: infer W }
      ? W
      : never
    : never = { status: "approved" };

  if (filters.cause) {
    (where as Record<string, unknown>).causeAreas = { has: filters.cause };
  }
  if (filters.type) {
    (where as Record<string, unknown>).eventTypes = { has: filters.type };
  }
  if (filters.location) {
    (where as Record<string, unknown>).locationName = {
      contains: filters.location,
      mode: "insensitive",
    };
  }
  if (filters.q) {
    (where as Record<string, unknown>).OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { hostName: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  // Date range filter takes precedence over month/year
  if (filters.date) {
    const now = new Date();
    let gte: Date;
    let lte: Date;
    switch (filters.date) {
      case "today":
        gte = startOfDay(now);
        lte = endOfDay(now);
        break;
      case "this_week":
        gte = startOfWeek(now, { weekStartsOn: 1 });
        lte = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "this_month":
        gte = startOfMonth(now);
        lte = endOfMonth(now);
        break;
      case "next_30_days":
        gte = startOfDay(now);
        lte = endOfDay(addDays(now, 30));
        break;
    }
    (where as Record<string, unknown>).startsAt = { gte, lte };
  } else if (filters.month && filters.year) {
    (where as Record<string, unknown>).startsAt = {
      gte: startOfMonth(new Date(filters.year, filters.month - 1, 1)),
      lte: endOfMonth(new Date(filters.year, filters.month - 1, 1)),
    };
  }

  // Default: soonest first
  let orderBy: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[] = {
    startsAt: "asc",
  };
  if (filters.sort === "date_desc") {
    orderBy = { startsAt: "desc" };
  } else if (filters.sort === "type_asc" || filters.sort === "type_desc") {
    // Postgres sorts text[] by first element alphabetically — good enough
    orderBy = [
      { eventTypes: filters.sort === "type_desc" ? "desc" : "asc" },
      { startsAt: "asc" },
    ];
  }

  const rows = await prisma.event.findMany({
    where,
    orderBy: orderBy as never,
  });
  return rows.map(mapToListEvent);
}

export async function getEventBySlug(slug: string): Promise<FullEvent | null> {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");

  const row = await prisma.event.findFirst({
    where: { slug, status: "approved" },
    include: {
      submitter: {
        select: {
          id: true,
          email: true,
          displayName: true,
          organizationType: true,
          bio: true,
          location: true,
          website: true,
          profileImageUrl: true,
          causeFocus: true,
          profileCompleted: true,
          createdAt: true,
        },
      },
    },
  });
  if (!row) return null;

  let organizerProfile = null;
  if (row.submitter && row.submitter.profileCompleted) {
    const totalEvents = await prisma.event.count({
      where: { submittedById: row.submitter.id, status: "approved" },
    });
    organizerProfile = {
      id: row.submitter.id,
      displayName: row.submitter.displayName ?? row.hostName,
      organizationType: row.submitter.organizationType,
      bio: row.submitter.bio,
      location: row.submitter.location,
      website: row.submitter.website,
      email: row.submitter.email,
      profileImageUrl: row.submitter.profileImageUrl,
      causeFocus: row.submitter.causeFocus,
      memberSince: format(row.submitter.createdAt, "MMMM yyyy"),
      totalEvents,
    };
  }

  return { ...mapToFullEvent(row), organizerProfile };
}

const ACCENT_BY_INDEX = ["primary", "secondary", "tertiary"];

export async function getEventsForCalendarMonth(
  year: number,
  month: number
): Promise<Map<number, CalendarDayEvent[]>> {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");

  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(new Date(year, month - 1, 1));

  const rows = await prisma.event.findMany({
    where: {
      status: "approved",
      startsAt: { gte: start, lte: end },
    },
    select: {
      slug: true,
      title: true,
      heroImageUrl: true,
      hostName: true,
      causeAreas: true,
      startsAt: true,
    },
    orderBy: { startsAt: "asc" },
  });

  const map = new Map<number, CalendarDayEvent[]>();
  for (const row of rows) {
    const day = row.startsAt.getDate();
    const colorIndex =
      row.causeAreas[0] !== undefined ? CAUSE_DOT_INDEX[row.causeAreas[0]] ?? 0 : 0;
    const entry: CalendarDayEvent = {
      slug: row.slug,
      title: row.title,
      heroImage: row.heroImageUrl,
      accent: ACCENT_BY_INDEX[colorIndex] ?? "primary",
      time: format(row.startsAt, "h:mm a"),
      host: row.hostName,
    };
    const existing = map.get(day) ?? [];
    map.set(day, [...existing, entry]);
  }
  return map;
}

export async function getEventCount(year: number, month: number): Promise<number> {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");

  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(new Date(year, month - 1, 1));

  return prisma.event.count({
    where: {
      status: "approved",
      startsAt: { gte: start, lte: end },
    },
  });
}

// ─── Admin queries ─────────────────────────────────────────────────────────────

export async function getPendingEvents(): Promise<DbEvent[]> {
  const rows = await prisma.event.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toDbEvent);
}

export async function getAllEventsForAdmin(): Promise<AdminEvent[]> {
  const rows = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submitter: {
        select: {
          id: true,
          email: true,
          displayName: true,
          organizationType: true,
          bio: true,
          location: true,
          website: true,
          profileImageUrl: true,
          causeFocus: true,
          profileCompleted: true,
          createdAt: true,
        },
      },
      flags: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return rows.map((row) => {
    const submitter: AdminEventSubmitter | null = row.submitter
      ? {
          ...row.submitter,
          createdAt: row.submitter.createdAt.toISOString(),
        }
      : null;
    const flags = row.flags.map((f) => ({
      id: f.id,
      reason: f.reason as "outdated" | "inappropriate" | "spam" | "inaccurate" | "other",
      message: f.message,
      reporterEmail: f.reporterEmail,
      resolvedAt: f.resolvedAt?.toISOString() ?? null,
      createdAt: f.createdAt.toISOString(),
    }));
    const openFlagCount = flags.filter((f) => !f.resolvedAt).length;
    return { ...toDbEvent(row), submitter, flags, openFlagCount };
  });
}

export async function getAdminStats(): Promise<{
  pending: number;
  approved: number;
  organizers: number;
}> {
  const [pending, approved, approvedRows] = await Promise.all([
    prisma.event.count({ where: { status: "pending" } }),
    prisma.event.count({ where: { status: "approved" } }),
    prisma.event.findMany({
      where: { status: "approved" },
      select: { submittedByEmail: true },
    }),
  ]);

  const organizers = new Set(approvedRows.map((r) => r.submittedByEmail)).size;

  return { pending, approved, organizers };
}
