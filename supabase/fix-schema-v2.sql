-- ===========================================
-- LUUC.AI - FIX v2: Agregar tablas de empresas
-- ===========================================
-- Maneja políticas existentes con DROP IF EXISTS
-- ===========================================

BEGIN;

-- ===========================================
-- 1. CREAR TABLA: companies (si no existe)
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
-- 2. CREAR TABLA: company_documents (si no existe)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    doc_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'aprobado' CHECK (category IN ('aprobado', 'borrador', 'ejemplo')),
    uploaded_by UUID REFERENCES public.users(id),
    word_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 3. AGREGAR COLUMNAS A users (si no existen)
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role VARCHAR(50) DEFAULT 'member';
    END IF;
END $$;

-- ===========================================
-- 4. AGREGAR company_id A documents y analyses
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN company_id UUID REFERENCES public.companies(id);
    END IF;
END $$;

-- ===========================================
-- 5. CREAR ÍNDICES
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
-- 6. HABILITAR RLS
-- ===========================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 7. POLÍTICAS RLS PARA companies
-- ===========================================
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Service role full access companies" ON public.companies;

CREATE POLICY "Users can view their company"
    ON public.companies FOR SELECT
    USING (user_id = auth.uid() OR id IN (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company"
    ON public.companies FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their company"
    ON public.companies FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Service role full access companies"
    ON public.companies FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ===========================================
-- 8. POLÍTICAS RLS PARA company_documents
-- ===========================================
DROP POLICY IF EXISTS "Users can view their company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Users can insert company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Users can update company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Users can delete company documents" ON public.company_documents;
DROP POLICY IF EXISTS "Service role full access company_documents" ON public.company_documents;

CREATE POLICY "Users can view their company documents"
    ON public.company_documents FOR SELECT
    USING (company_id IN (
        SELECT id FROM public.companies WHERE user_id = auth.uid()
        UNION
        SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
    ));

CREATE POLICY "Users can insert company documents"
    ON public.company_documents FOR INSERT
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can update company documents"
    ON public.company_documents FOR UPDATE
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete company documents"
    ON public.company_documents FOR DELETE
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access company_documents"
    ON public.company_documents FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ===========================================
-- 9. TRIGGERS
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_documents_updated_at ON public.company_documents;
CREATE TRIGGER update_company_documents_updated_at
    BEFORE UPDATE ON public.company_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Word count trigger
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_company_doc_word_count ON public.company_documents;
CREATE TRIGGER calculate_company_doc_word_count
    BEFORE INSERT OR UPDATE OF content ON public.company_documents
    FOR EACH ROW EXECUTE FUNCTION calculate_word_count();

COMMIT;

-- Verificación
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
