-- Table pour les réservations d'ouvrages du CBN
CREATE TABLE public.reservations_ouvrages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_author TEXT,
  document_year TEXT,
  support_type TEXT NOT NULL,
  support_status TEXT NOT NULL CHECK (support_status IN ('numerise', 'non_numerise', 'libre_acces')),
  is_free_access BOOLEAN NOT NULL DEFAULT false,
  request_physical BOOLEAN NOT NULL DEFAULT false,
  allow_physical_consultation BOOLEAN NOT NULL DEFAULT true,
  routed_to TEXT NOT NULL CHECK (routed_to IN ('bibliotheque_numerique', 'responsable_support')),
  statut TEXT NOT NULL DEFAULT 'soumise' CHECK (statut IN ('soumise', 'en_analyse', 'en_cours', 'validee', 'refusee', 'archivee')),
  requested_date DATE,
  motif TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  user_type TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_reservations_ouvrages_user_id ON public.reservations_ouvrages(user_id);
CREATE INDEX idx_reservations_ouvrages_document_id ON public.reservations_ouvrages(document_id);
CREATE INDEX idx_reservations_ouvrages_statut ON public.reservations_ouvrages(statut);
CREATE INDEX idx_reservations_ouvrages_created_at ON public.reservations_ouvrages(created_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER update_reservations_ouvrages_updated_at
  BEFORE UPDATE ON public.reservations_ouvrages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.reservations_ouvrages ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres réservations
CREATE POLICY "Users can view their own reservations"
  ON public.reservations_ouvrages
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_admin_or_librarian(auth.uid())
  );

-- Politique : Tout le monde peut créer une réservation
CREATE POLICY "Anyone can create a reservation"
  ON public.reservations_ouvrages
  FOR INSERT
  WITH CHECK (true);

-- Politique : Les admins/librarians peuvent modifier
CREATE POLICY "Admins can update reservations"
  ON public.reservations_ouvrages
  FOR UPDATE
  USING (public.is_admin_or_librarian(auth.uid()));

-- Politique : Les admins/librarians peuvent supprimer
CREATE POLICY "Admins can delete reservations"
  ON public.reservations_ouvrages
  FOR DELETE
  USING (public.is_admin_or_librarian(auth.uid()));