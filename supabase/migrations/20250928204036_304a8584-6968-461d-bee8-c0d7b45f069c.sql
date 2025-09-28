-- Correction des avertissements de sécurité - définir search_path pour les fonctions

-- Corriger la fonction generate_request_number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  request_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(request_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM legal_deposit_requests
  WHERE request_number LIKE 'DL-' || year_part || '-%';
  
  request_num := 'DL-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN request_num;
END;
$$;

-- Corriger la fonction generate_validation_code
CREATE OR REPLACE FUNCTION generate_validation_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Corriger la fonction set_request_number
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;