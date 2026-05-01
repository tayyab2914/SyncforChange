import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const FLAG_REASONS = [
  "outdated",
  "inappropriate",
  "spam",
  "inaccurate",
  "other",
] as const;

const flagSchema = z.object({
  reason: z.enum(FLAG_REASONS),
  message: z.string().max(500).optional(),
  reporterEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: slug } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = flagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.eventFlag.create({
    data: {
      eventId: event.id,
      reason: parsed.data.reason,
      message: parsed.data.message || null,
      reporterEmail: parsed.data.reporterEmail || null,
    },
  });

  return NextResponse.json({ ok: true });
}
