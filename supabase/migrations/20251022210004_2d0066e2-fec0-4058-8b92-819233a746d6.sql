-- Create table for cultural program contributions
CREATE TABLE IF NOT EXISTS public.program_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Étape 1: Demandeur
  nom_complet TEXT NOT NULL,
  type_demandeur TEXT NOT NULL CHECK (type_demandeur IN ('artiste', 'auteur', 'intervenant', 'association', 'institution', 'autre')),
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  organisme TEXT,
  adresse TEXT,
  cv_url TEXT NOT NULL,
  statut_juridique_url TEXT,
  
  -- Étape 2: Proposition
  type_activite TEXT NOT NULL CHECK (type_activite IN ('conference', 'atelier', 'exposition', 'concert', 'lecture', 'projection', 'debat', 'autre')),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  objectifs TEXT NOT NULL,
  public_cible TEXT NOT NULL CHECK (public_cible IN ('etudiants', 'professionnels', 'grand_public', 'jeunes', 'chercheurs', 'autre')),
  langue TEXT NOT NULL CHECK (langue IN ('arabe', 'francais', 'anglais', 'amazigh', 'autre')),
  nb_participants_estime INTEGER,
  dossier_projet_url TEXT NOT NULL,
  
  -- Étape 3: Logistique
  date_proposee DATE NOT NULL,
  heure_proposee TIME NOT NULL,
  duree_minutes INTEGER NOT NULL,
  moyens_techniques JSONB DEFAULT '[]'::jsonb,
  besoins_specifiques TEXT,
  espace_souhaite TEXT NOT NULL CHECK (espace_souhaite IN ('auditorium', 'salle_conference', 'espace_exposition', 'esplanade', 'autre')),
  
  -- Étape 4: Validation
  certification_exactitude BOOLEAN NOT NULL DEFAULT false,
  consentement_diffusion BOOLEAN NOT NULL DEFAULT false,
  
  -- Statut et workflow
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_examen', 'accepte', 'refuse', 'info_demandee')),
  motif_refus TEXT,
  message_info TEXT,
  date_examen TIMESTAMP WITH TIME ZONE,
  examine_par UUID REFERENCES auth.users(id),
  
  -- Métadonnées
  numero_reference TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un index sur email pour recherche rapide
CREATE INDEX idx_program_contributions_email ON public.program_contributions(email);

-- Créer un index sur statut
CREATE INDEX idx_program_contributions_statut ON public.program_contributions(statut);

-- Créer un index sur date proposée
CREATE INDEX idx_program_contributions_date ON public.program_contributions(date_proposee);

-- Enable Row Level Security
ALTER TABLE public.program_contributions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent créer leurs propres contributions
CREATE POLICY "Utilisateurs peuvent créer leurs contributions"
  ON public.program_contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Les utilisateurs peuvent voir leurs propres contributions
CREATE POLICY "Utilisateurs peuvent voir leurs contributions"
  ON public.program_contributions
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Les admins peuvent tout gérer
CREATE POLICY "Admins peuvent gérer toutes les contributions"
  ON public.program_contributions
  FOR ALL
  TO authenticated
  USING (is_admin_or_librarian(auth.uid()));

-- Fonction pour générer le numéro de référence
CREATE OR REPLACE FUNCTION generate_program_contribution_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  reference_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_reference, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM program_contributions
  WHERE numero_reference LIKE 'PROG-' || year_part || '-%';
  
  reference_num := 'PROG-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN reference_num;
END;
$$;

-- Trigger pour générer automatiquement le numéro de référence
CREATE OR REPLACE FUNCTION set_program_contribution_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.numero_reference IS NULL THEN
    NEW.numero_reference := generate_program_contribution_reference();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_program_contribution_reference
  BEFORE INSERT ON public.program_contributions
  FOR EACH ROW
  EXECUTE FUNCTION set_program_contribution_reference();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_program_contributions_updated_at
  BEFORE UPDATE ON public.program_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();