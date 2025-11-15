-- Créer la liste des langues pour les manuscrits
INSERT INTO autocomplete_lists (
  list_code,
  list_name,
  description,
  platform,
  module,
  is_active,
  max_levels
) VALUES (
  'langues_manuscrits',
  'Langues des manuscrits',
  'Liste des langues disponibles pour les manuscrits',
  'web',
  'manuscripts',
  true,
  1
) ON CONFLICT (list_code) DO NOTHING;

-- Ajouter des valeurs de langues
INSERT INTO autocomplete_list_values (
  list_id,
  value_code,
  value_label,
  level,
  is_active,
  sort_order
) 
SELECT 
  (SELECT id FROM autocomplete_lists WHERE list_code = 'langues_manuscrits'),
  value_code,
  value_label,
  1,
  true,
  sort_order
FROM (VALUES
  ('arabe', 'Arabe', 1),
  ('berbere', 'Berbère', 2),
  ('francais', 'Français', 3),
  ('espagnol', 'Espagnol', 4),
  ('anglais', 'Anglais', 5),
  ('latin', 'Latin', 6),
  ('hebreu', 'Hébreu', 7),
  ('grec', 'Grec', 8),
  ('turc', 'Turc', 9),
  ('persan', 'Persan', 10),
  ('portugais', 'Portugais', 11),
  ('italien', 'Italien', 12),
  ('allemand', 'Allemand', 13)
) AS t(value_code, value_label, sort_order)
ON CONFLICT (list_id, value_code) DO NOTHING;