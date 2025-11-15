-- Créer la liste Thématique pour les manuscrits
INSERT INTO autocomplete_lists (
  list_code,
  list_name,
  description,
  platform,
  module,
  is_active,
  max_levels
) VALUES (
  'thematique_manuscrits',
  'Thématiques des manuscrits',
  'Liste des thématiques pour la classification des manuscrits',
  'web',
  'manuscripts',
  true,
  1
);

-- Ajouter des valeurs de thématiques courantes
INSERT INTO autocomplete_list_values (
  list_id,
  value_code,
  value_label,
  level,
  is_active,
  sort_order
) 
SELECT 
  (SELECT id FROM autocomplete_lists WHERE list_code = 'thematique_manuscrits'),
  value_code,
  value_label,
  1,
  true,
  sort_order
FROM (VALUES
  ('histoire', 'Histoire', 1),
  ('philosophie', 'Philosophie', 2),
  ('litterature', 'Littérature', 3),
  ('poesie', 'Poésie', 4),
  ('sciences_religieuses', 'Sciences religieuses', 5),
  ('linguistique', 'Linguistique', 6),
  ('droit', 'Droit', 7),
  ('medecine', 'Médecine', 8),
  ('astronomie', 'Astronomie', 9),
  ('mathematiques', 'Mathématiques', 10),
  ('geographie', 'Géographie', 11),
  ('biographie', 'Biographie', 12),
  ('sciences_naturelles', 'Sciences naturelles', 13),
  ('arts', 'Arts', 14),
  ('mystique', 'Mystique', 15)
) AS t(value_code, value_label, sort_order);