import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Match both the base cookie and any chunks (.0, .1, …)
const AUTH_COOKIE_PREFIX =
  `sb-${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace("https://", "")
    .split(".")[0]}-auth-token`;

export async function GET(request: NextRequest) {
  // 1. Invalidate the session on Supabase's side
  const supabase = await createClient();
  await supabase.auth.signOut();

  // 2. Force-delete every auth cookie in the browser, including chunked ones.
  //    The Supabase SDK may not clear every chunk if the number of chunks
  //    written differs from what it expects to delete.
  const response = NextResponse.redirect(new URL("/login", request.url));

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith(AUTH_COOKIE_PREFIX)) {
      response.cookies.set(cookie.name, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}
