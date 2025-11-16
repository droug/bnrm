
-- Créer le trigger pour générer automatiquement le numéro de demande de location
DROP TRIGGER IF EXISTS trigger_set_rental_request_number ON rental_requests;
CREATE TRIGGER trigger_set_rental_request_number
  BEFORE INSERT ON rental_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION set_rental_request_number();

-- Mettre à jour les demandes existantes sans numéro
WITH numbered_requests AS (
  SELECT 
    id,
    'LOC-' || TO_CHAR(created_at, 'YYYY') || '-' || 
    LPAD(ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM created_at) ORDER BY created_at)::TEXT, 6, '0') as new_number
  FROM rental_requests
  WHERE request_number IS NULL OR request_number = ''
)
UPDATE rental_requests r
SET request_number = nr.new_number
FROM numbered_requests nr
WHERE r.id = nr.id;
