-- ============================================================================
-- SECURITY FIX H-2: Make audit_logs truly immutable
-- Run in Supabase SQL Editor
-- ============================================================================

-- RLS-level deny policies (catch JWT-authenticated modifications)
CREATE POLICY IF NOT EXISTS "Audit logs are immutable — no updates"
    ON public.audit_logs FOR UPDATE
    USING (false);

CREATE POLICY IF NOT EXISTS "Audit logs are immutable — no deletes"
    ON public.audit_logs FOR DELETE
    USING (false);

-- Trigger-level guard — fires even for service-role key, which bypasses RLS
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are immutable. Attempted operation: %', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_logs_immutability_guard ON public.audit_logs;
CREATE TRIGGER audit_logs_immutability_guard
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();
