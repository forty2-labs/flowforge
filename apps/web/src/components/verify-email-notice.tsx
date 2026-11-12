"use client";

import { Button, useToast } from "@flowforge/ui";
import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "@/lib/actions/auth";
import { requestErrorMessage, runAction } from "@/lib/query/request";

// Shown to signed-in people who have not opened their verification link yet.
// `children` replaces the default explanation where the page needs its own.
export function VerifyEmailNotice({
  email,
  children,
}: {
  email: string;
  children?: React.ReactNode;
}) {
  const toast = useToast();
  const resend = useMutation({
    mutationFn: () => runAction(() => resendVerification()),
    onSuccess: () => toast({ message: `We sent a new link to ${email}.` }),
    onError: (error) => toast({ message: requestErrorMessage(error), tone: "error" }),
  });

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg bg-warning-soft px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-body text-warning-strong">
        {children ?? (
          <>
            Confirm your email address. We sent a link to{" "}
            <b className="font-semibold">{email}</b>.
          </>
        )}
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="self-start sm:self-auto"
        loading={resend.isPending}
        onClick={() => resend.mutate()}
      >
        {resend.isPending ? "Sending…" : "Resend email"}
      </Button>
    </div>
  );
}
