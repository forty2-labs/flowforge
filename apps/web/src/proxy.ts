import { NextResponse, type NextRequest } from "next/server";

// The home page is static and public. A request for / that carries a
// session cookie is sent to /start, which checks the session and takes the
// person into the app. Only the cookie's presence is checked here; /start
// does the real check and clears a cookie that no longer works.
export function proxy(request: NextRequest) {
  if (request.cookies.has("ff_session")) {
    return NextResponse.redirect(new URL("/start", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };
