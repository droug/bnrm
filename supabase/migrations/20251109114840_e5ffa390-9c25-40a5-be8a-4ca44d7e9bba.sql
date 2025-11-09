-- Ajouter le champ kitab_status à la table legal_deposit_requests
ALTER TABLE public.legal_deposit_requests 
ADD COLUMN IF NOT EXISTS kitab_status TEXT CHECK (kitab_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_legal_deposit_kitab_status 
ON public.legal_deposit_requests(kitab_status);

-- Mettre à jour les RLS policies pour inclure le nouveau champ
COMMENT ON COLUMN public.legal_deposit_requests.kitab_status IS 'Statut de la publication pour le portail Kitab (pending, approved, rejected)';