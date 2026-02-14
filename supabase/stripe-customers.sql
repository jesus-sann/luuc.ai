-- ===========================================
-- STRIPE BILLING INTEGRATION
-- ===========================================
-- Add Stripe customer tracking and subscriptions
-- Run this migration in Supabase SQL Editor

-- ===========================================
-- ADD STRIPE CUSTOMER ID TO USERS TABLE
-- ===========================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
ON public.users(stripe_customer_id);

-- ===========================================
-- SUBSCRIPTIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired')),
    plan TEXT NOT NULL CHECK (plan IN ('free', 'plus', 'pro', 'enterprise')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (webhook will do this via service role)
CREATE POLICY "Users can insert own subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role full access"
    ON public.subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SYNC USER PLAN FROM SUBSCRIPTION
-- ===========================================

CREATE OR REPLACE FUNCTION sync_user_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- When subscription becomes active, update user plan
    IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
        UPDATE public.users
        SET plan = NEW.plan
        WHERE id = NEW.user_id;
    -- When subscription is canceled/expired, downgrade to free
    ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
        UPDATE public.users
        SET plan = 'free'
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_plan_on_subscription_change
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_plan_from_subscription();

-- ===========================================
-- HELPER FUNCTION: Get active subscription
-- ===========================================

CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    plan TEXT,
    status TEXT,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.plan,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
