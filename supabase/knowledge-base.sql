-- ============================================================================
-- KNOWLEDGE BASE - GENERICO PARA CUALQUIER TIPO DE EMPRESA
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================================================

BEGIN;

-- 1. Tabla principal: knowledge_base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Metadata del documento
  title VARCHAR(500) NOT NULL,
  filename VARCHAR(500),
  file_type VARCHAR(50), -- 'pdf', 'docx', 'txt', 'md', 'other'
  file_size INTEGER, -- Tamanio en bytes

  -- Categorizacion flexible (empresa define sus propias categorias)
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',

  -- Contenido
  content TEXT NOT NULL,
  content_summary TEXT,

  -- Metadata adicional (JSON para flexibilidad)
  metadata JSONB DEFAULT '{}',

  -- Tracking de uso
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Audit trail
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de categorias personalizadas por empresa
CREATE TABLE IF NOT EXISTS public.knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'folder', -- Nombre de icono lucide
  color VARCHAR(50) DEFAULT '#3B82F6', -- Color hex

  -- Orden y visibilidad
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Stats
  document_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: categoria unica por empresa
  UNIQUE(company_id, slug)
);

-- 3. Insertar categorias por defecto cuando se crea una empresa
CREATE OR REPLACE FUNCTION create_default_kb_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.knowledge_base_categories (company_id, name, slug, icon, display_order)
  VALUES
    (NEW.id, 'General', 'general', 'folder', 1),
    (NEW.id, 'Plantillas', 'plantillas', 'file-text', 2),
    (NEW.id, 'Documentos Aprobados', 'aprobados', 'check-circle', 3),
    (NEW.id, 'Manuales', 'manuales', 'book-open', 4),
    (NEW.id, 'Reportes', 'reportes', 'bar-chart-2', 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y recrear
DROP TRIGGER IF EXISTS trigger_create_default_kb_categories ON public.companies;
CREATE TRIGGER trigger_create_default_kb_categories
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION create_default_kb_categories();

-- 4. Funcion para actualizar document_count en categorias
CREATE OR REPLACE FUNCTION update_category_document_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.knowledge_base_categories
    SET document_count = document_count + 1
    WHERE company_id = NEW.company_id AND slug = NEW.category;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.knowledge_base_categories
    SET document_count = GREATEST(document_count - 1, 0)
    WHERE company_id = OLD.company_id AND slug = OLD.category;
  ELSIF TG_OP = 'UPDATE' AND NEW.category != OLD.category THEN
    UPDATE public.knowledge_base_categories
    SET document_count = GREATEST(document_count - 1, 0)
    WHERE company_id = OLD.company_id AND slug = OLD.category;

    UPDATE public.knowledge_base_categories
    SET document_count = document_count + 1
    WHERE company_id = NEW.company_id AND slug = NEW.category;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_category_count ON public.knowledge_base;
CREATE TRIGGER trigger_update_category_count
  AFTER INSERT OR DELETE OR UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_category_document_count();

-- 5. Indices para performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_company_id ON public.knowledge_base(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_usage ON public.knowledge_base(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created ON public.knowledge_base(created_at DESC);

-- Full-text search (soporta espanol e ingles)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search
  ON public.knowledge_base
  USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, '')));

CREATE INDEX IF NOT EXISTS idx_kb_categories_company ON public.knowledge_base_categories(company_id);

-- 6. RLS Policies
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_categories ENABLE ROW LEVEL SECURITY;

-- Policies para knowledge_base
DROP POLICY IF EXISTS "Users can view their company knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can view their company knowledge base"
  ON public.knowledge_base FOR SELECT
  USING (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Users can insert to their company knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can insert to their company knowledge base"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Users can update their company knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can update their company knowledge base"
  ON public.knowledge_base FOR UPDATE
  USING (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Users can delete from their company knowledge base" ON public.knowledge_base;
CREATE POLICY "Users can delete from their company knowledge base"
  ON public.knowledge_base FOR DELETE
  USING (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

-- Policies para knowledge_base_categories
DROP POLICY IF EXISTS "Users can view their company categories" ON public.knowledge_base_categories;
CREATE POLICY "Users can view their company categories"
  ON public.knowledge_base_categories FOR SELECT
  USING (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Users can manage their company categories" ON public.knowledge_base_categories;
CREATE POLICY "Users can manage their company categories"
  ON public.knowledge_base_categories FOR ALL
  USING (company_id IN (
    SELECT id FROM public.companies WHERE user_id = auth.uid()
    UNION
    SELECT company_id FROM public.users WHERE id = auth.uid() AND company_id IS NOT NULL
  ));

-- 7. Trigger para updated_at
CREATE OR REPLACE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON public.knowledge_base_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Funcion RPC para incrementar uso
CREATE OR REPLACE FUNCTION increment_kb_usage(doc_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE public.knowledge_base
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = ANY(doc_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- ============================================================================
-- VERIFICACION
-- ============================================================================
-- Ejecuta esto para verificar que todo se creo correctamente:
-- SELECT 'knowledge_base' as table_name, COUNT(*) as columns
-- FROM information_schema.columns
-- WHERE table_name = 'knowledge_base' AND table_schema = 'public'
-- UNION ALL
-- SELECT 'knowledge_base_categories', COUNT(*)
-- FROM information_schema.columns
-- WHERE table_name = 'knowledge_base_categories' AND table_schema = 'public';
