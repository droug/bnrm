-- Add commentaires_comite field and update status constraint
ALTER TABLE program_contributions
ADD COLUMN IF NOT EXISTS commentaires_comite TEXT;

-- Drop existing status check if it exists
ALTER TABLE program_contributions 
DROP CONSTRAINT IF EXISTS program_contributions_statut_check;

-- Add updated status constraint
ALTER TABLE program_contributions
ADD CONSTRAINT program_contributions_statut_check 
CHECK (statut IN ('en_attente', 'en_evaluation', 'acceptee', 'rejetee'));

-- Update existing 'acceptée' to 'acceptee' and 'rejetée' to 'rejetee' (if any exist)
UPDATE program_contributions 
SET statut = 'acceptee' 
WHERE statut = 'acceptée';

UPDATE program_contributions 
SET statut = 'rejetee' 
WHERE statut = 'rejetée';

-- Create function to check max active proposals per email
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
$$ LANGUAGE plpgsql;

-- Create trigger to enforce max active proposals
DROP TRIGGER IF EXISTS enforce_max_active_proposals ON program_contributions;
CREATE TRIGGER enforce_max_active_proposals
  BEFORE INSERT OR UPDATE ON program_contributions
  FOR EACH ROW
  EXECUTE FUNCTION check_max_active_proposals();