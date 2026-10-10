import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";

export default function Home() {
  return (
    <Suspense>
      <Landing />
    </Suspense>
  );
}

// Signed-in people land in their first workspace, or in onboarding.
async function Landing(): Promise<never> {
  const session = await requireSession();
  const first = session.workspaces[0];
  redirect(first ? `/w/${first.slug}` : "/workspaces/new");
}
