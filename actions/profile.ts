"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/session";
import { ORGANIZATION_TYPES, CAUSE_FOCUS_OPTIONS } from "@/lib/profile/constants";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120),
  organizationType: z.enum(ORGANIZATION_TYPES, {
    message: "Please select an organization type",
  }),
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters so attendees know who you are")
    .max(1000),
  location: z
    .string()
    .min(2, "Location is required (e.g. Brooklyn, NY)")
    .max(120),
  website: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().url("Enter a valid URL").optional()),
  profileImageUrl: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(
      z
        .string()
        .refine(
          (v) => v.startsWith("/uploads/") || /^https?:\/\//.test(v),
          "Enter a valid image URL or upload a file"
        )
        .optional()
    ),
  causeFocus: z
    .array(z.enum(CAUSE_FOCUS_OPTIONS))
    .min(1, "Select at least one cause area")
    .max(5, "Pick up to 5 cause areas"),
});

export type ProfileFormValues = {
  displayName?: string;
  organizationType?: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  causeFocus?: string[];
};

export type ProfileState = {
  errors?: Record<string, string[]>;
  values?: ProfileFormValues;
  success?: boolean;
};

export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) {
    return { errors: { root: ["You must be signed in."] } };
  }

  const causeFocus = formData.getAll("causeFocus").map(String);

  const raw = {
    displayName: String(formData.get("displayName") ?? "").trim(),
    organizationType: String(formData.get("organizationType") ?? ""),
    bio: String(formData.get("bio") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    profileImageUrl: String(formData.get("profileImageUrl") ?? "").trim(),
    causeFocus,
  };

  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
      if (v) fieldErrors[k] = v as string[];
    }
    return { errors: fieldErrors, values: raw };
  }

  const data = parsed.data;

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      displayName: data.displayName,
      organizationType: data.organizationType,
      bio: data.bio,
      location: data.location,
      website: data.website ?? null,
      profileImageUrl: data.profileImageUrl ?? null,
      causeFocus: data.causeFocus,
      profileCompleted: true,
    },
  });

  // Refresh JWT so middleware/page guards see the new flag immediately
  await setSessionCookie({
    userId: updated.id,
    email: updated.email,
    role: updated.role,
    emailVerified: updated.emailVerified,
    profileCompleted: updated.profileCompleted,
  });

  revalidatePath(`/profile/${updated.id}`);
  return { success: true };
}
