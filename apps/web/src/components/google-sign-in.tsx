"use client";

import { Alert, Button } from "@flowforge/ui";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { startGoogleSignIn } from "@/lib/actions/auth";
import { requestErrorMessage, runAction } from "@/lib/query/request";

// Sends the browser to Google. It comes back through /auth/callback, which
// signs the person in (or creates their account) and continues to `next`.
export function GoogleSignIn({ next }: { next: string }) {
  const start = useMutation({
    mutationFn: () => runAction(() => startGoogleSignIn(next)),
    onSuccess: ({ url }) => window.location.assign(url),
  });
  // Stay busy until Google's page replaces this one.
  const pending = start.isPending || start.isSuccess;
  const { reset } = start;

  // Coming back with the browser's Back button restores this page as it was
  // left, still busy. Make the button usable again.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [reset]);

  async function action() {
    await start.mutateAsync().catch(() => {
      // Shown from start.error below.
    });
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      {start.error && <Alert tone="error">{requestErrorMessage(start.error)}</Alert>}
      <Button type="submit" variant="secondary" size="lg" loading={pending}>
        {!pending && <Image src="/google-g.svg" alt="" width={18} height={18} unoptimized />}
        {pending ? "Opening Google…" : "Continue with Google"}
      </Button>
    </form>
  );
}
