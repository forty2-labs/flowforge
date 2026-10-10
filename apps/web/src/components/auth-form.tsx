"use client";

import { Alert, Button, TextField } from "@flowforge/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, signUp } from "@/lib/actions/auth";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const [state, action, pending] = useActionState(
    isSignUp ? signUp : signIn,
    EMPTY_FORM_STATE,
  );
  const next = useSearchParams().get("next") ?? "";
  const other = isSignUp ? "/signin" : "/signup";
  const otherHref = next ? `${other}?next=${encodeURIComponent(next)}` : other;

  return (
    <form action={action} className="flex flex-col gap-[18px]" aria-labelledby="auth-heading">
      <div className="flex flex-col gap-1.5">
        <h1
          id="auth-heading"
          className="text-[28px] leading-9 font-semibold tracking-[-0.015em]"
        >
          {isSignUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="text-[14.5px] text-fg-secondary">
          {isSignUp ? "Already have an account? " : "New to Flowforge? "}
          <Link href={otherHref} className="font-medium">
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <input type="hidden" name="next" value={next} />
      {isSignUp && (
        <TextField label="Your name" name="name" autoComplete="name" required maxLength={80} />
      )}
      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
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
