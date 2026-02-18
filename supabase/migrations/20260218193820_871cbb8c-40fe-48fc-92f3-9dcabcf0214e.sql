
-- Table pour les notes/signalements privés des lecteurs sur les documents
CREATE TABLE public.document_reader_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  document_title TEXT,
  document_type TEXT,
  document_cote TEXT,
  user_id UUID NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'information', -- 'information', 'erreur', 'suggestion', 'signalement'
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'en_cours', 'traite', 'ferme'
  admin_response TEXT,
  admin_response_by UUID,
  admin_response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_reader_notes ENABLE ROW LEVEL SECURITY;

-- Lecteurs peuvent insérer leurs propres notes
CREATE POLICY "Lecteurs peuvent soumettre des notes"
ON public.document_reader_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Lecteurs voient SEULEMENT leurs propres notes (pas celles des autres)
CREATE POLICY "Lecteurs voient uniquement leurs propres notes"
ON public.document_reader_notes
FOR SELECT
USING (auth.uid() = user_id);

-- Admins et bibliothécaires voient toutes les notes
CREATE POLICY "Admins voient toutes les notes"
ON public.document_reader_notes
FOR SELECT
USING (public.is_admin_or_librarian(auth.uid()));

-- Admins peuvent mettre à jour (répondre, changer le statut)
CREATE POLICY "Admins peuvent mettre a jour les notes"
ON public.document_reader_notes
FOR UPDATE
USING (public.is_admin_or_librarian(auth.uid()));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_document_reader_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_document_reader_notes_updated_at
BEFORE UPDATE ON public.document_reader_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_document_reader_notes_updated_at();
