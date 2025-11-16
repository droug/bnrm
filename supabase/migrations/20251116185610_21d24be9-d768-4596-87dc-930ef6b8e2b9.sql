-- Ajouter les colonnes pour le suivi du traitement des demandes
ALTER TABLE public.service_registrations
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;