-- Corriger les types d'abonnement pour correspondre à ceux de l'interface /abonnements
-- Les types sont: basic, researcher, premium (et non standard)

UPDATE public.digital_library_access_restrictions 
SET required_subscription_type = 'basic',
    subscription_message = 'Un abonnement Standard (Adhésion Standard) est requis pour consulter ce document intégralement.'
WHERE required_subscription_type = 'standard';

-- Mettre à jour les messages pour plus de clarté
UPDATE public.digital_library_access_restrictions 
SET subscription_message = 'Réservé aux chercheurs abonnés. Souscrivez à l''Adhésion Chercheur pour un accès complet.'
WHERE required_subscription_type = 'researcher';

UPDATE public.digital_library_access_restrictions 
SET subscription_message = 'Accès exclusif aux membres Premium. Souscrivez à l''Adhésion Premium pour un accès complet.'
WHERE required_subscription_type = 'premium';