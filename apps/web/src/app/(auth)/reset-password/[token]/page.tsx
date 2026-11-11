import type { PasswordResetPreviewDto } from "@flowforge/types";
import { Skeleton } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { api, ApiRequestError } from "@/lib/api";

export const metadata: Metadata = { title: "Choose a new password" };

export default function Page({ params }: PageProps<"/reset-password/[token]">) {
  return (
    <Suspense fallback={<ResetSkeleton />}>
      <Reset params={params} />
    </Suspense>
  );
}

// No client cache: the page has one read, checked before anything renders.
async function Reset({ params }: Pick<PageProps<"/reset-password/[token]">, "params">) {
  const { token } = await params;
  let reset: PasswordResetPreviewDto;
  try {
    reset = await api<PasswordResetPreviewDto>(
      `/auth/password/reset/${encodeURIComponent(token)}`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return (
        <Message title="This reset link is no longer valid">
          It may have been used already, or replaced by a newer one.
        </Message>
      );
    }
    throw error;
  }

  if (reset.expired) {
    return (
      <Message title="This reset link has expired">
        Reset links work for 1 hour.
      </Message>
    );
  }
  return <ResetPasswordForm token={token} email={reset.email} />;
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-page">{title}</h1>
        <p className="text-body text-fg-secondary">{children}</p>
      </div>
      <Link
        href="/forgot-password"
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-title font-medium text-white hover:bg-primary-hover hover:text-white"
      >
        Get a new link
      </Link>
    </div>
  );
}

function ResetSkeleton() {
  return (
    <div role="status" aria-busy="true" className="ff-delayed flex flex-col gap-3">
      <span className="sr-only">Checking your reset link</span>
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-3 h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
