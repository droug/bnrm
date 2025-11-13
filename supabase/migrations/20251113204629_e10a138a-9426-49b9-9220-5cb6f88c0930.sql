-- Ajouter les colonnes manquantes aux tables si elles n'existent pas déjà

-- Table publishers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='publishers' AND column_name='google_maps_link') THEN
        ALTER TABLE public.publishers ADD COLUMN google_maps_link TEXT;
    END IF;
END $$;

-- Table printers  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='printers' AND column_name='google_maps_link') THEN
        ALTER TABLE public.printers ADD COLUMN google_maps_link TEXT;
    END IF;
END $$;

-- Table producers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='producers' AND column_name='google_maps_link') THEN
        ALTER TABLE public.producers ADD COLUMN google_maps_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='producers' AND column_name='city') THEN
        ALTER TABLE public.producers ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='producers' AND column_name='country') THEN
        ALTER TABLE public.producers ADD COLUMN country TEXT;
    END IF;
END $$;

-- Table distributors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='distributors' AND column_name='google_maps_link') THEN
        ALTER TABLE public.distributors ADD COLUMN google_maps_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='distributors' AND column_name='city') THEN
        ALTER TABLE public.distributors ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='distributors' AND column_name='country') THEN
        ALTER TABLE public.distributors ADD COLUMN country TEXT;
    END IF;
END $$;