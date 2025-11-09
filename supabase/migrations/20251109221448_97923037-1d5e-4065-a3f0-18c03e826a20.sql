-- Ajouter la colonne document_status à la table reservations_requests
ALTER TABLE public.reservations_requests
ADD COLUMN document_status TEXT DEFAULT 'physique' CHECK (document_status IN ('numerise', 'physique', 'en_cours_numerisation'));

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.reservations_requests.document_status IS 'Statut du document: numerise (numérisé), physique (support physique), en_cours_numerisation (en cours de numérisation)';