-- Ajouter les colonnes pour la gestion des abonnements
ALTER TABLE public.digital_library_access_restrictions 
ADD COLUMN IF NOT EXISTS requires_subscription boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS required_subscription_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_message text DEFAULT NULL;

-- Mettre à jour les exemples existants avec des exigences d'abonnement variées
UPDATE public.digital_library_access_restrictions 
SET requires_subscription = false,
    subscription_message = NULL
WHERE access_level = 'public';

UPDATE public.digital_library_access_restrictions 
SET requires_subscription = true,
    required_subscription_type = 'standard',
    subscription_message = 'Un abonnement Standard est requis pour consulter ce document intégralement.'
WHERE access_level = 'copyrighted';

UPDATE public.digital_library_access_restrictions 
SET requires_subscription = true,
    required_subscription_type = 'researcher',
    subscription_message = 'Réservé aux chercheurs abonnés. Souscrivez à l''offre Chercheur pour un accès complet.'
WHERE access_level = 'restricted';

UPDATE public.digital_library_access_restrictions 
SET requires_subscription = true,
    required_subscription_type = 'premium',
    subscription_message = 'Accès exclusif aux abonnés Premium.'
WHERE access_level = 'internal';

-- Ajouter un commentaire sur la table
COMMENT ON COLUMN public.digital_library_access_restrictions.requires_subscription IS 'Indique si un abonnement est requis pour accéder au document';
COMMENT ON COLUMN public.digital_library_access_restrictions.required_subscription_type IS 'Type d''abonnement requis: standard, researcher, premium';
COMMENT ON COLUMN public.digital_library_access_restrictions.subscription_message IS 'Message affiché aux utilisateurs non abonnés';