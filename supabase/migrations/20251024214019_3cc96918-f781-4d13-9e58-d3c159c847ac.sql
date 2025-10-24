-- Ajouter un champ pour stocker les URLs des images des espaces culturels
ALTER TABLE cultural_spaces
ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;

-- Mettre à jour les espaces existants avec les images par défaut
UPDATE cultural_spaces
SET gallery_images = jsonb_build_array(
  jsonb_build_object(
    'url', '/placeholder.svg',
    'alt', name || ' - Vue 1',
    'order', 1
  ),
  jsonb_build_object(
    'url', '/placeholder.svg',
    'alt', name || ' - Vue 2',
    'order', 2
  )
)
WHERE gallery_images = '[]'::jsonb;