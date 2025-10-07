-- Ajouter le rôle 'producer' à l'enum user_role s'il n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'user_role' AND e.enumlabel = 'producer'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'producer';
  END IF;
END $$;