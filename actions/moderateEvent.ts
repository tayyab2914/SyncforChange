"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function approveEvent(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.event.update({
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

  revalidateTag("events", { expire: 0 });
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

  try {
    await prisma.event.update({
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

  revalidateTag("events", { expire: 0 });
  return {};
}
