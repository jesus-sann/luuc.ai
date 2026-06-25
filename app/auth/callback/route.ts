import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/audit-log";

/**
 * Sanitize the `next` redirect parameter to prevent open-redirect attacks.
 *
 * Only relative paths that start with "/" and do not contain protocol separators
 * ("//", "://") are accepted.  Everything else falls back to "/dashboard".
 *
 * Attack prevented:
 *   ?next=//evil.com      → redirects to evil.com (host-relative URL)
 *   ?next=https://evil.com → same issue
 */
function sanitizeNextParam(next: string | null): string {
  if (!next) return "/dashboard";
  // Must start with "/" and must NOT contain a protocol or double-slash
  if (next.startsWith("/") && !next.startsWith("//") && !next.includes("://")) {
    return next;
  }
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextParam(searchParams.get("next"));
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fire-and-forget auth.login audit entry — do not block the redirect.
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          auditLog({
            userId: data.user.id,
            action: "auth.login",
            resourceType: "session",
            metadata: { method: type === "recovery" ? "password_reset" : "oauth_or_email" },
          });
        }
      }).catch(() => {/* non-critical */});

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // URL to redirect to after sign in process fails
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
