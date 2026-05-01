import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isSubmitRoute =
    pathname.startsWith("/submit") && !pathname.startsWith("/submit/success");

  const isProfileSetup = pathname === "/profile/setup";

  if (!isAdminRoute && !isSubmitRoute && !isProfileSetup) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }

  if (isAdminRoute && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admins cannot submit events — they moderate, they don't post
  if (isSubmitRoute && session.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/moderation", request.url));
  }

  // Organizers must complete profile before submitting events
  if (
    isSubmitRoute &&
    session.role === "ORGANIZER" &&
    !session.profileCompleted
  ) {
    return NextResponse.redirect(
      new URL(`/profile/setup?next=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/submit",
    "/submit/:path*",
    "/profile/setup",
  ],
};
