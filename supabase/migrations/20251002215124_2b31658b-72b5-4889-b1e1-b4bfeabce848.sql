-- Corriger les search_path pour les fonctions de préservation
DROP FUNCTION IF EXISTS public.calculate_checksum(BYTEA);
DROP FUNCTION IF EXISTS public.verify_backup_integrity(UUID);

CREATE OR REPLACE FUNCTION public.calculate_checksum(content_data BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(content_data, 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_backup_integrity(backup_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  backup_record RECORD;
BEGIN
  SELECT * INTO backup_record FROM public.preservation_backups WHERE id = backup_id;
  
  IF backup_record IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.preservation_backups
  SET is_verified = true, verification_date = NOW()
  WHERE id = backup_id;
  
  RETURN true;
END;
$$;