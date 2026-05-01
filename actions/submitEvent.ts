"use server";

import { revalidateTag } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import {
  eventSubmitSchema,
  type EventSubmitInput,
} from "@/lib/validations/eventSubmission";

export type SubmittedValues = {
  title?: string;
  subtitle?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  host_name?: string;
  location_name?: string;
  address?: string;
  cause_areas?: string[];
  event_types?: string[];
  rsvp_link?: string;
  volunteer_link?: string;
  total_spots?: string;
  organizer_name?: string;
  organizer_role?: string;
  open_to_collaboration?: boolean;
  hero_image_url?: string;
};

export type SubmitEventState = {
  errors?: Partial<Record<keyof EventSubmitInput | "root", string[]>>;
  values?: SubmittedValues;
  success?: boolean;
};

export async function submitEvent(
  _prevState: SubmitEventState,
  formData: FormData
): Promise<SubmitEventState> {
  const session = await getSession();
  if (!session?.email) {
    return { errors: { root: ["You must be signed in to submit events."] } };
  }

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "cause_areas" || key === "event_types") {
      const existing = raw[key];
      raw[key] = Array.isArray(existing) ? [...existing, value] : [value];
    } else if (key === "total_spots") {
      raw[key] = value === "" ? undefined : Number(value);
    } else {
      raw[key] = value;
    }
  });

  // Checkboxes are absent from FormData when unchecked — handle explicitly
  raw["open_to_collaboration"] = formData.get("open_to_collaboration") === "on";
  raw["submitted_by_email"] = session.email;

  // Snapshot raw values so we can repopulate the form on validation failure
  const values: SubmittedValues = {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    description: String(formData.get("description") ?? ""),
    starts_at: String(formData.get("starts_at") ?? ""),
    ends_at: String(formData.get("ends_at") ?? ""),
    host_name: String(formData.get("host_name") ?? ""),
    location_name: String(formData.get("location_name") ?? ""),
    address: String(formData.get("address") ?? ""),
    cause_areas: formData.getAll("cause_areas").map(String),
    event_types: formData.getAll("event_types").map(String),
    rsvp_link: String(formData.get("rsvp_link") ?? ""),
    volunteer_link: String(formData.get("volunteer_link") ?? ""),
    total_spots: String(formData.get("total_spots") ?? ""),
    organizer_name: String(formData.get("organizer_name") ?? ""),
    organizer_role: String(formData.get("organizer_role") ?? ""),
    open_to_collaboration: formData.get("open_to_collaboration") === "on",
    hero_image_url: String(formData.get("hero_image_url") ?? ""),
  };

  const parsed = eventSubmitSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EventSubmitInput | "root", string[]>> = {};
    for (const [key, issues] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      fieldErrors[key as keyof EventSubmitInput] = issues as string[];
    }
    return { errors: fieldErrors, values };
  }

  const data = parsed.data;
  const base = slugify(data.title, { lower: true, strict: true });
  const slug = `${base}-${Date.now().toString(36)}`;

  try {
    await prisma.event.create({
      data: {
        slug,
        title: data.title,
        subtitle: data.subtitle ?? null,
        description: data.description,
        heroImageUrl: data.hero_image_url ?? null,
        startsAt: new Date(data.starts_at),
        endsAt: data.ends_at ? new Date(data.ends_at) : null,
        locationName: data.location_name,
        address: data.address ?? null,
        causeAreas: data.cause_areas,
        eventTypes: data.event_types,
        hostName: data.host_name,
        organizerName: data.organizer_name ?? null,
        organizerRole: data.organizer_role ?? null,
        organizerInitial: data.organizer_name?.[0]?.toUpperCase() ?? null,
        coHosts: [],
        openToCollaboration: data.open_to_collaboration,
        rsvpLink: data.rsvp_link ?? null,
        volunteerLink: data.volunteer_link ?? null,
        contactLink: data.contact_link ?? null,
        spotsLeft: data.total_spots ?? null,
        totalSpots: data.total_spots ?? null,
        status: "pending",
        submittedByEmail: data.submitted_by_email,
        submittedById: session.userId,
      },
    });
  } catch (err) {
    return {
      errors: {
        root: [`Submission failed: ${err instanceof Error ? err.message : "Unknown error"}`],
      },
    };
  }

  revalidateTag("events", { expire: 0 });
  return { success: true };
}
