CREATE TABLE IF NOT EXISTS public.uscis_updates (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID        REFERENCES public.companies(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  summary        TEXT        NOT NULL,
  category       TEXT        NOT NULL CHECK (category IN ('Policy Change', 'Fee Update', 'Form Revision', 'Processing Time', 'Alert')),
  effective_date DATE,
  source_url     TEXT,
  is_pinned      BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each company only sees its own updates
ALTER TABLE public.uscis_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uscis_updates_company_isolation"
  ON public.uscis_updates
  USING (
    company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1
    )
  );

CREATE INDEX IF NOT EXISTS uscis_updates_company_created_idx
  ON public.uscis_updates (company_id, created_at DESC);
