-- Rate limiting table: persistent, shared across all serverless instances
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key        TEXT        PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 0,
  reset_at   TIMESTAMPTZ NOT NULL
);

-- No RLS — only accessed via service role key (supabaseAdmin)
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

-- Index for cleanup of expired rows
CREATE INDEX IF NOT EXISTS rate_limits_reset_at_idx ON public.rate_limits (reset_at);

-- Atomic check-and-increment function.
-- Returns: allowed (bool), remaining (int), reset_at (timestamptz)
-- Uses INSERT ... ON CONFLICT to atomically handle window expiry and increment.
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key            TEXT,
  p_limit          INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
DECLARE
  v_count    INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_now      TIMESTAMPTZ := NOW();
BEGIN
  INSERT INTO public.rate_limits (key, count, reset_at)
  VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
  ON CONFLICT (key) DO UPDATE
    SET
      count    = CASE
                   WHEN rate_limits.reset_at <= v_now THEN 1
                   ELSE rate_limits.count + 1
                 END,
      reset_at = CASE
                   WHEN rate_limits.reset_at <= v_now
                     THEN v_now + (p_window_seconds || ' seconds')::INTERVAL
                   ELSE rate_limits.reset_at
                 END
  RETURNING rate_limits.count, rate_limits.reset_at
  INTO v_count, v_reset_at;

  RETURN QUERY SELECT
    (v_count <= p_limit)          AS allowed,
    GREATEST(0, p_limit - v_count) AS remaining,
    v_reset_at                    AS reset_at;
END;
$$;

-- Cleanup function to prune expired rows (run periodically or on demand)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limits WHERE reset_at < NOW();
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;
