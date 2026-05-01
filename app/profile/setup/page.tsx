import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";

export default function ProfileSetupPage() {
  return (
    <main className="pt-28 pb-20 max-w-2xl mx-auto px-6">
      <Suspense fallback={<div className="h-96 bg-stone-100 rounded-3xl animate-pulse" />}>
        <ProfileSetupContent />
      </Suspense>
    </main>
  );
}

async function ProfileSetupContent() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile/setup");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      displayName: true,
      organizationType: true,
      bio: true,
      location: true,
      website: true,
      profileImageUrl: true,
      causeFocus: true,
      profileCompleted: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <ProfileSetupForm
      initialValues={user}
      isFirstTime={!user.profileCompleted}
    />
  );
}
