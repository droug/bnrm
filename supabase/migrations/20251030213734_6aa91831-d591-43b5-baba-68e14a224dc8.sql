-- Ajouter un exemple de carte numérisée pour test
INSERT INTO cbn_catalog_documents (
  id,
  title,
  author,
  publisher,
  year,
  support_type,
  support_status,
  cote,
  physical_description,
  collection,
  language,
  summary,
  description,
  keywords
) VALUES (
  'CART-2024-001',
  'Carte administrative du Royaume du Maroc',
  'Direction de la Cartographie',
  'Institut Géographique National',
  '2023',
  'Carte',
  'numerise',
  'CART-2023-001',
  '1 carte : en couleur ; 120 x 90 cm',
  'Cartographie administrative',
  'Français',
  'Carte détaillée représentant l''organisation administrative du Royaume du Maroc avec les nouvelles délimitations régionales.',
  'Carte administrative officielle éditée par l''Institut Géographique National, échelle 1:1000000',
  ARRAY['cartographie', 'administration', 'géographie', 'Maroc', 'régions']
);