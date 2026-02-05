-- Mettre à jour le code de langue "am" vers "amz" pour Amazighe dans la table autocomplete_list_values
UPDATE public.autocomplete_list_values 
SET value_code = 'amz'
WHERE value_code = 'am' AND value_label LIKE '%Amazighe%';

-- S'assurer que l'Espagnol existe et a les bonnes valeurs
-- (il existe déjà avec le code 'es', cette requête est pour vérification)