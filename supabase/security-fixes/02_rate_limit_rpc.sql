-- ============================================================================
-- SECURITY FIX M-4: Deploy the check_and_increment_rate_limit RPC
-- This function is referenced in lib/rate-limit.ts but was never deployed.
-- Without it, all rate limiting falls back to per-instance in-memory storage,
-- which is not distributed across Vercel serverless instances.
-- Run in Supabase SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, reset_at TIMESTAMPTZ) AS $$
DECLARE
  v_count BIGINT;
  v_window_start TIMESTAMPTZ;
  v_reset TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Use advisory lock to prevent race conditions on concurrent requests
  PERFORM pg_advisory_xact_lock(hashtext(p_key));

  v_window_start := v_now - (p_window_seconds || ' seconds')::INTERVAL;
  v_reset := v_now + (p_window_seconds || ' seconds')::INTERVAL;

  -- Count requests in the current window
  SELECT COALESCE(SUM(rl.request_count), 0)
  INTO v_count
  FROM public.rate_limits rl
  WHERE rl.identifier = p_key
    AND rl.window_start > v_window_start;

  IF v_count >= p_limit THEN
    RETURN QUERY SELECT FALSE, v_reset;
    RETURN;
  END IF;

  -- Upsert into rate_limits table
  INSERT INTO public.rate_limits (identifier, window_start, request_count, endpoint)
  VALUES (p_key, v_now, 1, p_key)
  ON CONFLICT (identifier, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;

  RETURN QUERY SELECT TRUE, v_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
