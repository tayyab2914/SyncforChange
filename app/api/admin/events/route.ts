import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAllEventsForAdmin } from "@/lib/queries/events";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getAllEventsForAdmin();
  return NextResponse.json({ events });
}
