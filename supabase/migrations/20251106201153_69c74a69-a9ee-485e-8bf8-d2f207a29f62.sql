-- Table pour les adhésions au Catalogue Collectif CBM
CREATE TABLE public.cbm_adhesions_catalogue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  
  -- Étape 1: Informations Générales
  nom_bibliotheque TEXT NOT NULL,
  type_bibliotheque TEXT NOT NULL,
  tutelle TEXT NOT NULL,
  adresse TEXT NOT NULL,
  region TEXT NOT NULL,
  ville TEXT NOT NULL,
  url_maps TEXT,
  
  -- Étape 2: Contact et Responsables
  directeur TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  referent_technique TEXT NOT NULL,
  responsable_catalogage TEXT NOT NULL,
  
  -- Étape 3: Infrastructure Technique (spécifique au catalogue)
  sigb TEXT NOT NULL,
  nombre_documents INTEGER NOT NULL,
  normes_catalogage TEXT,
  volumetrie JSONB,
  url_catalogue TEXT,
  
  -- Engagements
  engagement_charte BOOLEAN NOT NULL DEFAULT false,
  engagement_partage_donnees BOOLEAN NOT NULL DEFAULT false,
  
  -- Métadonnées
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les adhésions au Réseau des Bibliothèques Marocaines
CREATE TABLE public.cbm_adhesions_reseau (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  
  -- Étape 1: Informations Générales
  nom_bibliotheque TEXT NOT NULL,
  type_bibliotheque TEXT NOT NULL,
  tutelle TEXT NOT NULL,
  adresse TEXT NOT NULL,
  region TEXT NOT NULL,
  ville TEXT NOT NULL,
  url_maps TEXT,
  
  -- Étape 2: Contact et Responsables
  directeur TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  referent_technique TEXT NOT NULL,
  responsable_catalogage TEXT NOT NULL,
  
  -- Étape 3: Infrastructure Technique (spécifique au réseau)
  moyens_recensement TEXT NOT NULL,
  en_cours_informatisation TEXT NOT NULL,
  nombre_documents INTEGER NOT NULL,
  volumetrie JSONB,
  url_catalogue TEXT,
  
  -- Engagements
  engagement_charte BOOLEAN NOT NULL DEFAULT false,
  engagement_partage_donnees BOOLEAN NOT NULL DEFAULT false,
  
  -- Métadonnées
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cbm_adhesions_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_adhesions_reseau ENABLE ROW LEVEL SECURITY;

-- Policies pour cbm_adhesions_catalogue
CREATE POLICY "Users can view their own catalogue adhesions" 
ON public.cbm_adhesions_catalogue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catalogue adhesions" 
ON public.cbm_adhesions_catalogue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogue adhesions" 
ON public.cbm_adhesions_catalogue 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies pour cbm_adhesions_reseau
CREATE POLICY "Users can view their own reseau adhesions" 
ON public.cbm_adhesions_reseau 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reseau adhesions" 
ON public.cbm_adhesions_reseau 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reseau adhesions" 
ON public.cbm_adhesions_reseau 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger pour updated_at sur cbm_adhesions_catalogue
CREATE TRIGGER update_cbm_adhesions_catalogue_updated_at
BEFORE UPDATE ON public.cbm_adhesions_catalogue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour updated_at sur cbm_adhesions_reseau
CREATE TRIGGER update_cbm_adhesions_reseau_updated_at
BEFORE UPDATE ON public.cbm_adhesions_reseau
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();