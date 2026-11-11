"use client";

import { Alert, Button, TextField, useToast } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const reset = useMutation({
    mutationFn: (password: string) => runAction(() => resetPassword({ token, password })),
    onSuccess: ({ session, redirectTo }) => {
      // Every other session was signed out, so nothing cached from before applies.
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session(), session);
      toast({ message: "Password changed. You’re signed in." });
      router.replace(redirectTo);
    },
  });
  // Stay busy until the next page replaces this one.
  const pending = reset.isPending || reset.isSuccess;

  async function action(formData: FormData) {
    await reset.mutateAsync(String(formData.get("password") ?? "")).catch(() => {
      // Shown from reset.error below.
    });
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]" aria-labelledby="reset-heading">
      <div className="flex flex-col gap-1.5">
        <h1 id="reset-heading" className="text-page">
          Choose a new password
        </h1>
        <p className="text-body text-fg-secondary">
          For {email}. You’ll be signed out everywhere else.
        </p>
      </div>

      {reset.error && <Alert tone="error">{requestErrorMessage(reset.error)}</Alert>}

      {/* Lets password managers save the new password against the right account. */}
      <input type="hidden" name="username" autoComplete="username" value={email} />
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={200}
        hint="At least 8 characters."
      />
      <Button type="submit" size="lg" loading={pending}>
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}
