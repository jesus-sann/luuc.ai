-- ===========================================
-- LUUC.AI - SOLO TABLAS DE EMPRESAS
-- ===========================================
-- Ejecutar SOLO este archivo (borra todo lo demás del editor)
-- ===========================================

-- 1. Crear tabla companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    industry VARCHAR(100),
    description TEXT,
    document_rules JSONB DEFAULT '{"style": "formal", "language": "es"}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla company_documents
CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    doc_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'aprobado',
    uploaded_by UUID REFERENCES public.users(id),
    word_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agregar columnas a users (si no existen)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';

-- 4. Agregar company_id a documents y analyses
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS company_id UUID;

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_company_id ON public.analyses(company_id);

-- 6. Habilitar RLS en nuevas tablas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para companies
CREATE POLICY "Users can view their company" ON public.companies FOR SELECT
    USING (user_id = auth.uid() OR id IN (SELECT company_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can insert their company" ON public.companies FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE
    USING (user_id = auth.uid());

-- 8. Políticas para company_documents
CREATE POLICY "Users can view their company documents" ON public.company_documents FOR SELECT
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()
        UNION SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL));
CREATE POLICY "Users can insert company documents" ON public.company_documents FOR INSERT
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
CREATE POLICY "Users can update company documents" ON public.company_documents FOR UPDATE
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete company documents" ON public.company_documents FOR DELETE
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- Verificación
SELECT 'Tablas creadas:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
