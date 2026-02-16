-- ===========================================
-- LUUC.AI - Team Invitations Schema
-- ===========================================
-- Ejecutar en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ===========================================

BEGIN;

-- ===========================================
-- 1. TABLA: Invitaciones
-- ===========================================
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 2. ÍNDICES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at);

-- ===========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins can view invitations for their company
DROP POLICY IF EXISTS "Admins can view company invitations" ON public.invitations;
CREATE POLICY "Admins can view company invitations"
    ON public.invitations FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid() AND role IN ('admin')
        )
        OR
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Admins can create invitations
DROP POLICY IF EXISTS "Admins can create invitations" ON public.invitations;
CREATE POLICY "Admins can create invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid() AND role IN ('admin')
        )
        OR
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Admins can update invitations (cancel)
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;
CREATE POLICY "Admins can update invitations"
    ON public.invitations FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid() AND role IN ('admin')
        )
        OR
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- Admins can delete invitations
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.invitations;
CREATE POLICY "Admins can delete invitations"
    ON public.invitations FOR DELETE
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid() AND role IN ('admin')
        )
        OR
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );

-- ===========================================
-- 4. FUNCIÓN: Limpiar invitaciones expiradas
-- ===========================================
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    UPDATE public.invitations
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 5. VISTA: Invitaciones con info de empresa
-- ===========================================
CREATE OR REPLACE VIEW public.invitations_with_company AS
SELECT
    i.*,
    c.name as company_name,
    u.name as invited_by_name,
    u.email as invited_by_email
FROM public.invitations i
JOIN public.companies c ON i.company_id = c.id
JOIN public.users u ON i.invited_by = u.id;

COMMIT;

-- ===========================================
-- VERIFICACIÓN
-- ===========================================
-- SELECT * FROM public.invitations LIMIT 5;
