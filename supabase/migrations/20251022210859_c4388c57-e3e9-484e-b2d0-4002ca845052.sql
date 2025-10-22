-- Fix search_path for the new function
CREATE OR REPLACE FUNCTION check_max_active_proposals()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) 
      FROM program_contributions 
      WHERE email = NEW.email 
      AND statut IN ('en_attente', 'en_evaluation')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
     ) >= 3 THEN
    RAISE EXCEPTION 'Cette adresse email a déjà 3 propositions actives. Veuillez attendre qu''une proposition soit traitée avant d''en soumettre une nouvelle.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;