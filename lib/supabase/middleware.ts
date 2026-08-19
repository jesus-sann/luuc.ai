import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes that never require authentication
const PUBLIC_ROUTES = new Set([
  "/", "/login", "/register", "/auth/callback",
  "/precios", "/terminos", "/privacidad", "/seguridad",
  "/forgot-password", "/reset-password",
]);

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/invite/")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() here instead of getUser().
  // getSession() reads the JWT from the cookie — no network call to Supabase,
  // which means no risk of MIDDLEWARE_INVOCATION_TIMEOUT on the Edge.
  // API routes and server components call getUser() (with server-side verification)
  // when they actually need to trust the user's identity.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const hasSession = !!session;

  if (!hasSession && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
