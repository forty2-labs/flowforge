"use client";

import { Alert, Button } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { verifyEmail } from "@/lib/actions/auth";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

// Confirming takes a click rather than happening when the page loads, so mail
// scanners that open links do not use them up.
export function VerifyEmail({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const verify = useMutation({
    mutationFn: () => runAction(() => verifyEmail(token)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.session() }),
  });

  if (verify.isSuccess) {
    return (
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page">Email confirmed</h1>
          <p className="text-body text-fg-secondary">
            {verify.data.email} is confirmed. You can now accept invitations sent
            to it.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-title font-medium text-white hover:bg-primary-hover hover:text-white"
        >
          Continue to Flowforge
        </Link>
      </div>
    );
  }

  async function action() {
    await verify.mutateAsync().catch(() => {
      // Shown from verify.error below.
    });
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]" aria-labelledby="verify-heading">
      <div className="flex flex-col gap-1.5">
        <h1 id="verify-heading" className="text-page">
          Confirm your email
        </h1>
        <p className="text-body text-fg-secondary">
          Confirm this is your email address to finish setting up your account.
        </p>
      </div>
      {verify.error && (
        <Alert tone="error">
          {requestErrorMessage(verify.error)} Sign in to send yourself a new link.
        </Alert>
      )}
      <Button type="submit" size="lg" loading={verify.isPending}>
        {verify.isPending ? "Confirming…" : "Confirm email"}
      </Button>
    </form>
  );
}
