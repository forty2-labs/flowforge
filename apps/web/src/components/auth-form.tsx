"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp, type SignUpInput } from "@/lib/actions/auth";
import { queryKeys } from "@/lib/query/keys";
import { requestErrorMessage, runAction } from "@/lib/query/request";

// The reference pattern for a TanStack Query mutation over a server action.
export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const router = useRouter();
  const queryClient = useQueryClient();
  const next = useSearchParams().get("next") ?? "";

  const auth = useMutation({
    mutationFn: (input: SignUpInput) =>
      runAction(() => (isSignUp ? signUp(input) : signIn(input))),
    onSuccess: ({ session, redirectTo }) => {
      // Whatever reads the session next gets it without another request.
      queryClient.setQueryData(queryKeys.session(), session);
      router.replace(redirectTo);
    },
  });
  // Stay busy until the next page replaces this one.
  const pending = auth.isPending || auth.isSuccess;

  // A form action, not onSubmit, so the browser cannot send the form as a GET
  // before hydration. React clears the fields afterwards; name and email come
  // back through defaultValue.
  async function action(formData: FormData) {
    await auth
      .mutateAsync({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        next,
      })
      .catch(() => {
        // Shown from auth.error below.
      });
  }

  const other = isSignUp ? "/signin" : "/signup";
  const otherHref = next ? `${other}?next=${encodeURIComponent(next)}` : other;

  return (
    <form action={action} className="flex flex-col gap-[18px]" aria-labelledby="auth-heading">
      <div className="flex flex-col gap-1.5">
        <h1
          id="auth-heading"
          className="text-page"
        >
          {isSignUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="text-body text-fg-secondary">
          {isSignUp ? "Already have an account? " : "New to Flowforge? "}
          <Link href={otherHref} className="font-medium">
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>

      {auth.error && <Alert tone="error">{requestErrorMessage(auth.error)}</Alert>}

      {isSignUp && (
        <TextField
          label="Your name"
          name="name"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={auth.variables?.name}
        />
      )}
      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={auth.variables?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        required
        minLength={isSignUp ? 8 : undefined}
        hint={isSignUp ? "At least 8 characters." : undefined}
      />
      <Button type="submit" size="lg" loading={pending}>
        {isSignUp
          ? pending
            ? "Creating account…"
            : "Create account"
          : pending
            ? "Signing in…"
            : "Sign in"}
      </Button>
    </form>
  );
}
