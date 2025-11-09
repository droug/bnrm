-- Ajouter un champ pour distinguer les nouvelles parutions des publications à paraître
ALTER TABLE public.legal_deposit_requests 
ADD COLUMN IF NOT EXISTS publication_status TEXT CHECK (publication_status IN ('published', 'upcoming')) DEFAULT 'published';

-- Créer un index pour améliorer les performances des requêtes filtrées
CREATE INDEX IF NOT EXISTS idx_legal_deposit_publication_status 
ON public.legal_deposit_requests(publication_status);

-- Créer un index composite pour optimiser les requêtes Kitab
CREATE INDEX IF NOT EXISTS idx_legal_deposit_kitab_combined 
ON public.legal_deposit_requests(kitab_status, publication_status) 
WHERE kitab_status = 'approved';

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.legal_deposit_requests.publication_status IS 'Statut de publication pour Kitab: published (nouvelles parutions) ou upcoming (à paraître)';

-- Créer une vue pour faciliter l'accès aux publications Kitab approuvées
CREATE OR REPLACE VIEW public.kitab_publications AS
SELECT 
  id,
  request_number,
  title,
  subtitle,
  author_name,
  support_type,
  monograph_type,
  language,
  publication_date,
  page_count,
  isbn,
  issn,
  ismn,
  dl_number,
  metadata,
  publication_status,
  kitab_status,
  created_at,
  updated_at
FROM public.legal_deposit_requests
WHERE kitab_status = 'approved'
ORDER BY 
  CASE 
    WHEN publication_status = 'upcoming' THEN publication_date
    ELSE created_at
  END DESC NULLS LAST;

-- Ajouter un commentaire pour documenter la vue
COMMENT ON VIEW public.kitab_publications IS 'Vue des publications approuvées pour le portail Kitab (nouvelles parutions et à paraître)';

-- Mettre à jour les publications existantes en fonction de la date de publication
-- Si la date est dans le futur, c'est "à paraître", sinon c'est "publié"
UPDATE public.legal_deposit_requests
SET publication_status = CASE
  WHEN publication_date IS NULL OR publication_date <= CURRENT_DATE THEN 'published'
  WHEN publication_date > CURRENT_DATE THEN 'upcoming'
  ELSE 'published'
END
WHERE publication_status IS NULL;