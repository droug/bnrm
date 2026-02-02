-- Insérer des tranches BNRM pour les différents types de numéros

-- Tranches ISBN BNRM
INSERT INTO reserved_number_ranges (
  requester_name, requester_email, deposit_type, number_type, 
  range_start, range_end, current_position, 
  total_numbers, used_numbers, used_numbers_list, status, notes
) VALUES 
('BNRM - Tranche Nationale', 'bnrm@bnrm.ma', 'monographie', 'isbn', 
 '978-9920-01-000-0', '978-9920-01-999-9', '978-9920-01-000-0', 
 1000, 0, ARRAY[]::text[], 'active', 'Tranche ISBN nationale BNRM - 1000 numéros disponibles'),

('BNRM - Tranche Régionale', 'bnrm@bnrm.ma', 'monographie', 'isbn', 
 '978-9920-02-000-0', '978-9920-02-499-9', '978-9920-02-000-0', 
 500, 0, ARRAY[]::text[], 'active', 'Tranche ISBN régionale BNRM - 500 numéros disponibles'),

('BNRM - Tranche Universitaire', 'bnrm@bnrm.ma', 'monographie', 'isbn', 
 '978-9920-03-000-0', '978-9920-03-299-9', '978-9920-03-000-0', 
 300, 0, ARRAY[]::text[], 'active', 'Tranche ISBN universitaire BNRM - 300 numéros disponibles'),

-- Tranches ISSN BNRM
('BNRM - Périodiques Nationaux', 'bnrm@bnrm.ma', 'periodique', 'issn', 
 '2820-1000', '2820-1499', '2820-1000', 
 500, 0, ARRAY[]::text[], 'active', 'Tranche ISSN périodiques nationaux - 500 numéros'),

('BNRM - Revues Scientifiques', 'bnrm@bnrm.ma', 'periodique', 'issn', 
 '2820-2000', '2820-2299', '2820-2000', 
 300, 0, ARRAY[]::text[], 'active', 'Tranche ISSN revues scientifiques - 300 numéros'),

-- Tranches DL BNRM
('BNRM - Dépôt Légal 2025', 'bnrm@bnrm.ma', 'monographie', 'dl', 
 'DL-2025-001000', 'DL-2025-009999', 'DL-2025-001000', 
 9000, 0, ARRAY[]::text[], 'active', 'Tranche Dépôt Légal 2025 - 9000 numéros'),

('BNRM - Dépôt Légal 2026', 'bnrm@bnrm.ma', 'monographie', 'dl', 
 'DL-2026-001000', 'DL-2026-009999', 'DL-2026-001000', 
 9000, 0, ARRAY[]::text[], 'active', 'Tranche Dépôt Légal 2026 - 9000 numéros');