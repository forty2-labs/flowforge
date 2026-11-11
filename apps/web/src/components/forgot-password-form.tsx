"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { requestErrorMessage, runAction } from "@/lib/query/request";

export function ForgotPasswordForm() {
  const reset = useMutation({
    mutationFn: (email: string) => runAction(() => requestPasswordReset(email)),
  });

  async function action(formData: FormData) {
    await reset.mutateAsync(String(formData.get("email") ?? "")).catch(() => {
      // Shown from reset.error below.
    });
  }

  if (reset.isSuccess) {
    return (
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-page">Check your email</h1>
          <p className="text-body text-fg-secondary">
            If there’s a Flowforge account for {reset.variables}, we’ve sent it a
            link to choose a new password. The link works for 1 hour.
          </p>
        </div>
        <p className="text-body text-fg-secondary">
          Nothing arrived? Check your spam folder, or{" "}
          <button
            type="button"
            className="cursor-pointer font-medium text-link hover:text-link-hover"
            onClick={() => reset.reset()}
          >
            try another email
          </button>
          .
        </p>
        <Link href="/signin" className="text-body font-medium">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-[18px]"
      aria-labelledby="forgot-heading"
    >
      <div className="flex flex-col gap-1.5">
        <h1 id="forgot-heading" className="text-page">
          Reset your password
        </h1>
        <p className="text-body text-fg-secondary">
          Enter the email you sign in with, and we’ll send you a link to choose a
          new password.
        </p>
      </div>

      {reset.error && <Alert tone="error">{requestErrorMessage(reset.error)}</Alert>}

      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={reset.variables}
      />
      <Button type="submit" size="lg" loading={reset.isPending}>
        {reset.isPending ? "Sending link…" : "Send reset link"}
      </Button>
      <p className="text-body text-fg-secondary">
        Remembered it?{" "}
        <Link href="/signin" className="font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
