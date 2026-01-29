-- ===========================================
-- LUUC.AI - Multi-Tenant: Empresas + Documentos de Referencia
-- ===========================================
-- Ejecutar en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ===========================================

BEGIN;

-- ===========================================
-- 1. TABLA: Empresas
-- ===========================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    industry VARCHAR(100),
    description TEXT,
    document_rules JSONB DEFAULT '{"style": "formal", "language": "es"}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 2. TABLA: Documentos de Referencia de Empresa
-- ===========================================
CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    doc_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'aprobado' CHECK (category IN ('aprobado', 'borrador', 'ejemplo')),
    uploaded_by UUID REFERENCES public.users(id),
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 3. ACTUALIZAR TABLA USERS
-- ===========================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer'));

-- ===========================================
-- 4. AGREGAR company_id A DOCUMENTS Y ANALYSES
-- ===========================================
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

ALTER TABLE public.analyses
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- ===========================================
-- 5. ÍNDICES PARA PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_doc_type ON public.company_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_company_documents_category ON public.company_documents(category);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_company_id ON public.analyses(company_id);

-- ===========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
CREATE POLICY "Users can view their company"
    ON public.companies FOR SELECT
    USING (user_id = auth.uid() OR id IN (
        SELECT company_id FROM public.users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
CREATE POLICY "Users can insert their company"
    ON public.companies FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
CREATE POLICY "Users can update their company"
    ON public.companies FOR UPDATE
    USING (user_id = auth.uid());

-- Políticas para company_documents
DROP POLICY IF EXISTS "Users can view their company documents" ON public.company_documents;
CREATE POLICY "Users can view their company documents"
    ON public.company_documents FOR SELECT
    USING (company_id IN (
        SELECT id FROM public.companies WHERE user_id = auth.uid()
        UNION
        SELECT company_id FROM public.users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can insert company documents" ON public.company_documents;
CREATE POLICY "Users can insert company documents"
    ON public.company_documents FOR INSERT
    WITH CHECK (company_id IN (
        SELECT id FROM public.companies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update company documents" ON public.company_documents;
CREATE POLICY "Users can update company documents"
    ON public.company_documents FOR UPDATE
    USING (company_id IN (
        SELECT id FROM public.companies WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete company documents" ON public.company_documents;
CREATE POLICY "Users can delete company documents"
    ON public.company_documents FOR DELETE
    USING (company_id IN (
        SELECT id FROM public.companies WHERE user_id = auth.uid()
    ));

-- ===========================================
-- 7. TRIGGERS PARA updated_at
-- ===========================================
CREATE OR REPLACE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_company_documents_updated_at
    BEFORE UPDATE ON public.company_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ===========================================
-- VERIFICACIÓN
-- ===========================================
-- Ejecutar esto para verificar que las tablas existen:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
