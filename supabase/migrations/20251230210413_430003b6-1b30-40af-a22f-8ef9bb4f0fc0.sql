-- Insert the test document A-52675 into content table
INSERT INTO public.content (
  id,
  title,
  slug,
  content_type,
  excerpt,
  content_body,
  status,
  file_url,
  file_type,
  author_id,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Revue Al-Maktaba - A-52675',
  'revue-al-maktaba-a-52675',
  'page',
  'Document de test - Revue bibliothéconomique marocaine numérisée',
  '<p>Ce document fait partie de la collection de revues numérisées de la Bibliothèque Nationale du Royaume du Maroc.</p>',
  'published',
  '/documents/A-52675_compressed.pdf',
  'PDF',
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4',
  NOW(),
  NOW(),
  NOW()
);