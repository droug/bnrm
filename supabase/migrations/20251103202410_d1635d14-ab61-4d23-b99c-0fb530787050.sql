-- Ajouter la colonne payment_method à la table restoration_requests
ALTER TABLE public.restoration_requests 
ADD COLUMN IF NOT EXISTS payment_method TEXT;