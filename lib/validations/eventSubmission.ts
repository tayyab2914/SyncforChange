import { z } from "zod";

const causeAreaEnum = z.enum([
  "Health",
  "Education",
  "Environment",
  "Food Security",
  "Housing",
  "Youth",
  "Seniors",
  "Arts & Culture",
  "Civic Engagement",
  "Animal Welfare",
  "Other",
]);

const eventTypeEnum = z.enum([
  "Workshop",
  "Gala",
  "Community",
  "Networking",
  "Fundraiser",
  "Volunteer",
  "Conference",
  "Webinar",
  "Other",
]);

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().url().optional());

export const eventSubmitSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    subtitle: z.string().max(300).optional(),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(5000),
    starts_at: z.string().min(1, "Start date is required"),
    ends_at: z.string().optional(),
    location_name: z
      .string()
      .min(2, "Location is required")
      .max(200),
    address: z.string().max(300).optional(),
    cause_areas: z
      .array(causeAreaEnum)
      .min(1, "Select at least one cause area")
      .max(3, "Select up to 3 cause areas"),
    event_types: z
      .array(eventTypeEnum)
      .min(1, "Select at least one event type")
      .max(2, "Select up to 2 event types"),
    rsvp_link: optionalUrl,
    volunteer_link: optionalUrl,
    contact_link: optionalUrl,
    total_spots: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .or(z.literal(0).transform(() => undefined)),
    open_to_collaboration: z.boolean(),
    host_name: z.string().min(2, "Organization name is required").max(150),
    organizer_name: z.string().max(150).optional(),
    organizer_role: z.string().max(100).optional(),
    submitted_by_email: z.string().email("Valid email is required"),
    hero_image_url: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.ends_at) return true;
      return new Date(data.ends_at) > new Date(data.starts_at);
    },
    { message: "End time must be after start time", path: ["ends_at"] }
  );

export type EventSubmitInput = z.infer<typeof eventSubmitSchema>;
