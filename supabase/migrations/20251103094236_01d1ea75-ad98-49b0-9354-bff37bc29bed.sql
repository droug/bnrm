-- Ajouter une colonne pour stocker l'URL du devis signé
ALTER TABLE public.restoration_requests
ADD COLUMN IF NOT EXISTS signed_quote_url TEXT;