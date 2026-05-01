import { Suspense } from "react";
import { redirect } from "next/navigation";

async function Redirector(): Promise<React.ReactNode> {
  redirect("/admin/moderation");
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <Redirector />
    </Suspense>
  );
}
