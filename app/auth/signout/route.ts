import { NextRequest, NextResponse } from "next/server";

// Match both the base cookie and any chunks (.0, .1, …)
// Hard-code the project ref as a fallback in case the env var is absent.
const PROJECT_REF =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace("https://", "")
    .split(".")[0] || "jcznbbeevjpifjqxddrd";

const AUTH_COOKIE_PREFIX = `sb-${PROJECT_REF}-auth-token`;

export async function GET(request: NextRequest) {
  // We do NOT call supabase.auth.signOut() here because that invalidates the
  // refresh token server-side, which prevents the user from logging back in
  // with the same session if they cancel. Cookie deletion is enough to log
  // the user out of this browser.
  //
  // The browser cookies are cleared via Set-Cookie: name=; maxAge=0.
  // We iterate ALL request cookies so we catch every chunk, regardless of how
  // many the Supabase client wrote.

  const response = NextResponse.redirect(new URL("/login", request.url));

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith(AUTH_COOKIE_PREFIX)) {
      response.cookies.set(cookie.name, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  // Also clear the PKCE code-verifier cookie, which @supabase/ssr writes
  // during password/OAuth flows (key ends with "-code-verifier").
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.endsWith("-code-verifier")) {
      response.cookies.set(cookie.name, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}
