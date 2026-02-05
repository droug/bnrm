-- Mettre à jour le libellé "Amazigh" vers "Amazighe" dans la table autocomplete_list_values
UPDATE public.autocomplete_list_values 
SET value_label = 'Amazighe (Tifinagh)'
WHERE value_code = 'am' AND value_label = 'Amazigh (Tifinagh)';