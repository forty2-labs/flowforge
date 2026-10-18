import { Wordmark } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create workspace" };

export default function NewWorkspacePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-xl border border-line bg-surface p-7">
        <Wordmark />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page">
            Create a workspace
          </h1>
          <p className="text-body text-fg-secondary">
            A workspace is a business or project. It holds your content, your
            team and every website built from them.
          </p>
        </div>
        <CreateWorkspaceForm />
        <Suspense>
          <BackLink />
        </Suspense>
      </div>
    </main>
  );
}

async function BackLink() {
  const session = await requireSession();
  const first = session.workspaces[0];
  if (!first) return null;
  return (
    <Link href={`/w/${first.slug}`} className="text-label font-medium">
      Back to {first.name}
    </Link>
  );
}
