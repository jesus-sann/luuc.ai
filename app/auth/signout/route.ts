import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /auth/signout
 *
 * Server-side sign-out: Supabase clears the auth cookies via Set-Cookie
 * response headers, then redirects to /login.
 *
 * Using a server route (instead of client-side supabase.auth.signOut + router.push)
 * prevents the race condition where router.refresh() fires before the browser
 * has processed the client-side cookie deletion, causing the middleware to see
 * a stale session cookie and redirect back to /dashboard.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
