import { type NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Minimal Edge middleware — no Supabase SDK, no network calls.
//
// Auth check: Supabase SSR stores the session in cookies named
// `sb-<project-ref>-auth-token` (possibly chunked as `.0`, `.1`, …).
// Checking for cookie presence is enough to decide whether to redirect;
// actual cryptographic token verification happens in every API route and
// server component via getCurrentUser() → supabase.auth.getUser().
// ---------------------------------------------------------------------------

const SUPABASE_PROJECT_REF =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace("https://", "")
    .split(".")[0]; // e.g. "jcznbbeevjpifjqxddrd"

const SESSION_COOKIE_PREFIX = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

function hasSession(request: NextRequest): boolean {
  // The session exists if any cookie name starts with the auth-token prefix
  return request.cookies.getAll().some((c) => c.name.startsWith(SESSION_COOKIE_PREFIX));
}

// Public routes — no auth required
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/precios",
  "/terminos",
  "/privacidad",
  "/seguridad",
]);

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/invite/")
  );
}

// In-memory rate limit for auth page POST submissions (no network I/O)
const AUTH_WINDOW_MS = 60_000;
const AUTH_LIMIT = 10;
const authMemory = new Map<string, { count: number; resetAt: number }>();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = authMemory.get(ip);
  if (!entry || now > entry.resetAt) {
    authMemory.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return true;
  }
  if (entry.count >= AUTH_LIMIT) return false;
  entry.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth form submissions
  if (request.method === "POST" && (pathname === "/login" || pathname === "/register")) {
    const ip = getClientIp(request);
    if (!checkAuthRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Demasiados intentos. Espera un momento." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  const authenticated = hasSession(request);

  // Redirect unauthenticated users away from protected pages
  if (!authenticated && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/register
  if (authenticated && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Page routes only — API routes handle their own auth.
    // Also exclude static assets and the PDF worker.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};
