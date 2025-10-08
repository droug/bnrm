-- Partie 1: Ajouter les nouveaux rôles à l'enum user_role
DO $$ 
BEGIN
  -- Ajouter 'producer' si pas déjà présent
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'producer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'producer';
  END IF;
END $$;

DO $$ 
BEGIN
  -- Ajouter 'editor' si pas déjà présent
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'editor' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'editor';
  END IF;
END $$;

DO $$ 
BEGIN
  -- Ajouter 'printer' si pas déjà présent
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'printer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'printer';
  END IF;
END $$;