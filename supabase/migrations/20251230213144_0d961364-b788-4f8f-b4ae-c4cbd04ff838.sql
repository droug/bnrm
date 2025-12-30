-- Update the document with the cover image
UPDATE public.content
SET 
  featured_image_url = '/images/covers/matalib-al-shaab-cover.jpg',
  updated_at = NOW()
WHERE id = 'f74bf753-4018-41ae-b182-877fc7e192c1';