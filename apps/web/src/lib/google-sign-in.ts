// Why a Google sign-in came back without a session. /auth/callback puts the
// code in the sign-in page's URL, and the page shows the message. Codes, not
// text, so a crafted link cannot make the page say something else.
const MESSAGES = {
  cancelled: "Google sign-in was cancelled. Try again, or use your email and password.",
  conflict:
    "An account with this email already exists, and Google hasn’t confirmed the address. Sign in with your password instead.",
  unavailable: "Google sign-in isn’t available right now. Use your email and password, or try again later.",
  failed: "Google sign-in didn’t work. Try again.",
} as const;

export type GoogleSignInError = keyof typeof MESSAGES;

export function googleErrorMessage(code: string | null): string | null {
  return code && Object.hasOwn(MESSAGES, code) ? MESSAGES[code as GoogleSignInError] : null;
}
