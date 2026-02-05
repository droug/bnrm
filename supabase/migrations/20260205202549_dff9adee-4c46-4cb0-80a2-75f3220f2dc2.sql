-- Fix the file_url paths to work correctly with the build system
-- The assets are bundled by Vite, we need to reference them from the src/assets folder via import
-- For now, we'll update to use public folder paths or placeholder URLs

-- Update to use placeholder image URLs that will work universally
UPDATE cms_visual_resources 
SET file_url = 'https://safeppmznupzqkqmzjzt.supabase.co/storage/v1/object/public/cms-media/visual-resources/' || category || '/' || REPLACE(name, ' ', '-') || '.' || file_type
WHERE file_url LIKE '/assets/%';

-- Actually, let's set a flag to indicate these need to be uploaded
-- For now, use a simpler placeholder approach with real public URLs
UPDATE cms_visual_resources SET file_url = '/placeholder.svg' WHERE file_url LIKE '%supabase%';