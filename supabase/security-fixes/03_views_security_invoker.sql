-- Security fix: apply SECURITY INVOKER to views that expose PII.
-- Without this, Postgres evaluates views under the definer's privileges,
-- meaning RLS on the underlying tables is bypassed when views are queried directly.
-- With SECURITY INVOKER the caller's row-level security applies.

-- user_stats: exposes email, plan, document counts per user
ALTER VIEW public.user_stats SET (security_invoker = true);

-- invitations_with_company: exposes invited_by_email and company data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'invitations_with_company'
  ) THEN
    ALTER VIEW public.invitations_with_company SET (security_invoker = true);
  END IF;
END
$$;
