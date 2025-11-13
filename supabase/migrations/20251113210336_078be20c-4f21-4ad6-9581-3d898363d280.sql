-- Add google_maps_link column to publishers table
ALTER TABLE publishers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- Add google_maps_link column to printers table
ALTER TABLE printers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- Add google_maps_link, city, and country columns to producers table
ALTER TABLE producers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE producers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE producers ADD COLUMN IF NOT EXISTS country TEXT;

-- Add google_maps_link, city, and country columns to distributors table
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS country TEXT;