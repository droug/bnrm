-- Supprimer l'ancienne contrainte et en créer une nouvelle incluant 'ismn'
ALTER TABLE reserved_number_ranges DROP CONSTRAINT reserved_number_ranges_number_type_check;

ALTER TABLE reserved_number_ranges ADD CONSTRAINT reserved_number_ranges_number_type_check 
  CHECK (number_type = ANY (ARRAY['isbn'::text, 'issn'::text, 'ismn'::text, 'dl'::text]));

-- Ajouter les tranches ISMN BNRM
INSERT INTO reserved_number_ranges (
  requester_name, requester_email, deposit_type, number_type, 
  range_start, range_end, current_position, 
  total_numbers, used_numbers, used_numbers_list, status, notes
) VALUES 
('BNRM - Musique Imprimée', 'bnrm@bnrm.ma', 'monographie', 'ismn', 
 '979-0-9001-0000-0', '979-0-9001-0999-9', '979-0-9001-0000-0', 
 1000, 0, ARRAY[]::text[], 'active', 'Tranche ISMN musique imprimée - 1000 numéros disponibles'),

('BNRM - Partitions Nationales', 'bnrm@bnrm.ma', 'monographie', 'ismn', 
 '979-0-9002-0000-0', '979-0-9002-0499-9', '979-0-9002-0000-0', 
 500, 0, ARRAY[]::text[], 'active', 'Tranche ISMN partitions nationales - 500 numéros');