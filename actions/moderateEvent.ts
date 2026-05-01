"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import {
  safeSend,
  sendEventApprovedEmail,
  sendEventRejectedEmail,
} from "@/lib/auth/email";

export async function requestEditsAction(
  id: string,
  feedback: string
): Promise<{ error?: string }> {
  // Same effect as reject — keeps the event in `rejected` state with feedback,
  // but the email phrasing is "update needed" rather than "rejected"
  return rejectEvent(id, feedback);
}

export async function deleteEventAction(
  id: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  try {
    await prisma.event.delete({ where: { id } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delete failed" };
  }
  updateTag("events");
  return {};
}

export async function resolveFlagsAction(
  eventId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }
  try {
    await prisma.eventFlag.updateMany({
      where: { eventId, resolvedAt: null },
      data: { resolvedAt: new Date() },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }
  updateTag("events");
  return {};
}

export async function approveEvent(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  let updated;
  try {
    updated = await prisma.event.update({
      where: { id },
      data: {
        status: "approved",
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  updateTag("events");

  await safeSend("event-approved", () =>
    sendEventApprovedEmail({
      organizerEmail: updated.submittedByEmail,
      organizerName: updated.organizerName,
      eventTitle: updated.title,
      eventSlug: updated.slug,
      startsAt: updated.startsAt,
      locationName: updated.locationName,
      hostName: updated.hostName,
    })
  );

  return {};
}

export async function rejectEvent(
  id: string,
  reason: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  let updated;
  try {
    updated = await prisma.event.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionReason: reason,
        reviewedBy: session.userId,
        reviewedAt: new Date(),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  updateTag("events");

  await safeSend("event-rejected", () =>
    sendEventRejectedEmail({
      organizerEmail: updated.submittedByEmail,
      organizerName: updated.organizerName,
      eventTitle: updated.title,
      eventSlug: updated.slug,
      startsAt: updated.startsAt,
      locationName: updated.locationName,
      hostName: updated.hostName,
      reason,
    })
  );

  return {};
}
