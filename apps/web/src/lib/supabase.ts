import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase Auth is used only to run the Google sign-in. Its cookies hold the
// PKCE verifier between leaving for Google and /auth/callback, and its session
// is thrown away as soon as the API has started an ff_session.
//
// Server-side only, so the URL and key stay out of the browser bundle.
// Returns null when Supabase is not configured. Call it only from a server
// action or route handler, because it writes cookies.
export async function createSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => {
        for (const { name, value, options } of items) store.set(name, value, options);
      },
    },
  });
}
