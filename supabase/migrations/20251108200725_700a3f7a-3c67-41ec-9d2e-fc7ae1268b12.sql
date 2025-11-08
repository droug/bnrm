-- Rendre les colonnes adresse nullable dans les tables d'adhésions CBM
ALTER TABLE public.cbm_adhesions_catalogue 
ALTER COLUMN adresse DROP NOT NULL;

ALTER TABLE public.cbm_adhesions_reseau 
ALTER COLUMN adresse DROP NOT NULL;