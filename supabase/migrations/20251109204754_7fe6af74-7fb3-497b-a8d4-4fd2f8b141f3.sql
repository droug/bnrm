-- Créer la table document_copies
CREATE TABLE IF NOT EXISTS public.document_copies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  copy_number TEXT NOT NULL,
  cote TEXT NOT NULL,
  barcode TEXT,
  location TEXT,
  availability_status TEXT NOT NULL DEFAULT 'disponible',
  unavailability_reason TEXT,
  unavailable_until TIMESTAMP WITH TIME ZONE,
  sigb_copy_id TEXT UNIQUE,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  sigb_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_copies_document_id ON public.document_copies(document_id);
CREATE INDEX IF NOT EXISTS idx_document_copies_availability ON public.document_copies(availability_status);
CREATE INDEX IF NOT EXISTS idx_document_copies_cote ON public.document_copies(cote);
CREATE INDEX IF NOT EXISTS idx_document_copies_sigb_id ON public.document_copies(sigb_copy_id);

ALTER TABLE public.document_copies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "copies_select_all" 
  ON public.document_copies FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "copies_admin_all" 
  ON public.document_copies FOR ALL USING (is_admin_or_librarian(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS update_document_copies_updated_at ON public.document_copies;
CREATE TRIGGER update_document_copies_updated_at
BEFORE UPDATE ON public.document_copies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer données exemples
INSERT INTO public.document_copies (document_id, copy_number, cote, location, availability_status, unavailability_reason, unavailable_until, sigb_copy_id, notes)
VALUES 
  ('DOC001', 'Copie 1', 'A.123.456.C1', 'Magasin Principal', 'disponible', NULL, NULL, 'SIGB_001_C1', 'Excellent état'),
  ('DOC001', 'Copie 2', 'A.123.456.C2', 'Salle de Lecture', 'emprunte', 'Emprunté', '2025-12-15 14:00:00+00', 'SIGB_001_C2', NULL),
  ('DOC001', 'Copie 3', 'A.123.456.C3', 'Atelier', 'en_restauration', 'Restauration', '2025-12-30 10:00:00+00', 'SIGB_001_C3', NULL),
  ('DOC002', 'Copie 1', 'B.789.012.C1', 'Magasin Principal', 'disponible', NULL, NULL, 'SIGB_002_C1', NULL),
  ('DOC002', 'Copie 2', 'B.789.012.C2', 'Salle de Lecture', 'disponible', NULL, NULL, 'SIGB_002_C2', NULL),
  ('DOC003', 'Copie 1', 'C.345.678.C1', 'Atelier Reliure', 'en_reliure', 'Reliure', '2026-01-15 09:00:00+00', 'SIGB_003_C1', NULL),
  ('DOC004', 'Copie 1', 'D.901.234.C1', 'Magasin Principal', 'disponible', NULL, NULL, 'SIGB_004_C1', NULL),
  ('DOC004', 'Copie 2', 'D.901.234.C2', 'Salle de Lecture', 'reserve', 'Exposition', '2025-12-20 18:00:00+00', 'SIGB_004_C2', NULL),
  ('DOC004', 'Copie 3', 'D.901.234.C3', 'Magasin Secondaire', 'disponible', NULL, NULL, 'SIGB_004_C3', NULL)
ON CONFLICT (sigb_copy_id) DO NOTHING;

-- Ajouter colonnes à reservations_ouvrages
ALTER TABLE public.reservations_ouvrages
ADD COLUMN IF NOT EXISTS copy_id UUID REFERENCES public.document_copies(id),
ADD COLUMN IF NOT EXISTS document_cote TEXT,
ADD COLUMN IF NOT EXISTS is_student_pfe BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pfe_theme TEXT,
ADD COLUMN IF NOT EXISTS pfe_proof_url TEXT;

CREATE INDEX IF NOT EXISTS idx_reservations_copy_id ON public.reservations_ouvrages(copy_id);
CREATE INDEX IF NOT EXISTS idx_reservations_cote ON public.reservations_ouvrages(document_cote);