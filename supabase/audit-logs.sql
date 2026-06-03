-- ===========================================
-- LUUC.AI - Audit Logs Table
-- ===========================================
-- Para compliance legal y seguridad
-- Ejecutar en Supabase SQL Editor
-- ===========================================

-- ===========================================
-- 1. TABLA: audit_logs
-- ===========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- SECURITY: user_id is nullable so audit records survive user deletion
    -- (compliance requires retaining audit trails even after account removal).
    -- ON DELETE SET NULL preserves the log row with the user_id nullified.
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),  -- IPv6 compatible
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_company_id ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);

-- ===========================================
-- 2. ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins de la empresa pueden ver audit logs de su empresa
CREATE POLICY "Company admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        -- El usuario puede ver sus propios logs
        auth.uid() = user_id
        OR
        -- O es admin/owner de la empresa
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    );

-- Solo el sistema puede insertar logs (via service role)
-- No hay política de INSERT para usuarios normales
-- Se insertan solo vía supabaseAdmin (service role key)

-- ===========================================
-- 3. COMENTARIOS PARA DOCUMENTACIÓN
-- ===========================================
COMMENT ON TABLE public.audit_logs IS 'Audit trail for legal compliance and security monitoring. Retention: 7 years recommended.';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed: document.generate, document.view, document.delete, kb.upload, etc.';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Type of resource: document, company_document, user, company, etc.';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional context about the action (title, category, etc.)';

-- ===========================================
-- 4. FUNCIÓN PARA LIMPIAR LOGS ANTIGUOS (OPCIONAL)
-- ===========================================
-- Ejecutar manualmente o via cron job
-- Mantiene logs de los últimos 7 años para compliance legal

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '7 years';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FIN
-- ===========================================
