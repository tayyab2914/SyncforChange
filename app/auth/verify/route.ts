import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth/tokens";
import { setSessionCookie } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const rawToken = searchParams.get("token");

  if (!rawToken) {
    return NextResponse.redirect(new URL("/login?verify=missing", origin));
  }

  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.redirect(new URL("/login?verify=invalid", origin));
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return NextResponse.redirect(new URL("/login?verify=expired", origin));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  await setSessionCookie({
    userId: record.user.id,
    email: record.user.email,
    role: record.user.role,
    emailVerified: true,
    profileCompleted: record.user.profileCompleted,
  });

  if (record.user.role === "ORGANIZER" && !record.user.profileCompleted) {
    return NextResponse.redirect(
      new URL("/profile/setup?next=/submit", origin)
    );
  }
  return NextResponse.redirect(new URL("/submit", origin));
}
