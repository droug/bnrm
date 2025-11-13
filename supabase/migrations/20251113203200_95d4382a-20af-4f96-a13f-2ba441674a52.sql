-- Ajouter google_maps_link aux tables existantes
ALTER TABLE publishers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE producers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS google_maps_link TEXT;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Maroc';
ALTER TABLE producers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE producers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Maroc';
ALTER TABLE printers ADD COLUMN IF NOT EXISTS google_maps_link TEXT;