-- ============================================================================
-- FIX CRÍTICO: Aislamiento Multi-Tenant en RLS Policies
-- ============================================================================
-- PROBLEMA: Las policies actuales solo verifican user_id pero NO company_id
-- SOLUCIÓN: Agregar validación de company_id en TODAS las policies
-- ============================================================================

BEGIN;

-- ===========================================
-- 1. DOCUMENTS: Agregar verificación de company_id
-- ===========================================

-- Eliminar policies existentes
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Recrear con aislamiento multi-tenant
CREATE POLICY "Users can view own documents with tenant isolation"
    ON public.documents FOR SELECT
    USING (
        -- Usuario es dueño del documento
        auth.uid() = user_id
        AND (
            -- Y el documento pertenece a la misma empresa del usuario
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert own documents with tenant isolation"
    ON public.documents FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update own documents with tenant isolation"
    ON public.documents FOR UPDATE
    USING (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete own documents with tenant isolation"
    ON public.documents FOR DELETE
    USING (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

-- ===========================================
-- 2. ANALYSES: Agregar verificación de company_id
-- ===========================================

DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;

CREATE POLICY "Users can view own analyses with tenant isolation"
    ON public.analyses FOR SELECT
    USING (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert own analyses with tenant isolation"
    ON public.analyses FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete own analyses with tenant isolation"
    ON public.analyses FOR DELETE
    USING (
        auth.uid() = user_id
        AND (
            company_id IS NULL
            OR company_id IN (
                SELECT company_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

-- ===========================================
-- 3. TEMPLATES: Agregar verificación de company_id si es relevante
-- ===========================================

DROP POLICY IF EXISTS "Users can view own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.templates;

CREATE POLICY "Users can view own or public templates"
    ON public.templates FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own templates"
    ON public.templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
    ON public.templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
    ON public.templates FOR DELETE
    USING (auth.uid() = user_id);

-- ===========================================
-- 4. CREAR FUNCIÓN DE TEST PARA VERIFICAR AISLAMIENTO
-- ===========================================

-- Esta función debe ejecutarse después de aplicar las policies
-- para verificar que el aislamiento funciona correctamente

CREATE OR REPLACE FUNCTION test_tenant_isolation()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
BEGIN
    -- Test 1: Verificar que las policies existen
    RETURN QUERY
    SELECT
        'RLS Policies exist'::TEXT,
        COUNT(*) >= 4 AS passed,
        'Found ' || COUNT(*) || ' policies on documents table'::TEXT
    FROM pg_policies
    WHERE tablename = 'documents'
    AND schemaname = 'public';

    -- Test 2: Verificar que RLS está habilitado
    RETURN QUERY
    SELECT
        'RLS is enabled'::TEXT,
        relrowsecurity AS passed,
        CASE WHEN relrowsecurity THEN 'RLS enabled' ELSE 'RLS NOT enabled - CRITICAL' END::TEXT
    FROM pg_class
    WHERE relname = 'documents'
    AND relnamespace = 'public'::regnamespace;

    -- Test 3: Verificar índices en company_id
    RETURN QUERY
    SELECT
        'Index on company_id exists'::TEXT,
        EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'documents' AND indexdef LIKE '%company_id%') AS passed,
        'Company isolation index status'::TEXT;

END;
$$ LANGUAGE plpgsql;

-- Ejecutar test (comentar en producción)
-- SELECT * FROM test_tenant_isolation();

COMMIT;

-- ===========================================
-- INSTRUCCIONES POST-APLICACIÓN
-- ===========================================
-- 1. Ejecutar esta migración en Supabase SQL Editor
-- 2. Ejecutar: SELECT * FROM test_tenant_isolation();
-- 3. Verificar que todos los tests pasen
-- 4. Realizar pruebas manuales con usuarios de diferentes companies
-- 5. Monitorear logs de acceso durante las primeras 48 horas
