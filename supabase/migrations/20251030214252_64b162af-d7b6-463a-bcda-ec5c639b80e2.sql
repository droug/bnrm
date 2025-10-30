-- Mettre à jour la carte existante pour avoir 1 page
UPDATE cbn_catalog_documents 
SET pages = 1, support_status = 'libre_acces'
WHERE id = 'CART-2024-001';

-- Ajouter une deuxième carte avec plusieurs pages
INSERT INTO cbn_catalog_documents (
  id,
  title,
  author,
  publisher,
  year,
  support_type,
  support_status,
  cote,
  pages,
  physical_description,
  collection,
  language,
  summary,
  description,
  keywords
) VALUES (
  'CART-2024-002',
  'Atlas géographique du Maroc - Edition complète',
  'Institut Royal de la Cartographie',
  'Éditions Royales',
  '2024',
  'Carte',
  'libre_acces',
  'CART-2024-002',
  45,
  '45 cartes : en couleur ; 120 x 90 cm',
  'Atlas cartographiques',
  'Français',
  'Atlas complet du Royaume du Maroc comprenant cartes physiques, administratives, climatiques et économiques.',
  'Atlas cartographique détaillé en 45 planches couvrant tous les aspects géographiques du Maroc',
  ARRAY['cartographie', 'géographie', 'atlas', 'Maroc']
);