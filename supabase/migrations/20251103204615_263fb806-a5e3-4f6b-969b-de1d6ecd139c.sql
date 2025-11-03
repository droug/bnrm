-- Restaurer les tarifs qui s'appliquent sur I001, I002, I003, S001, S002, S003
INSERT INTO bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active) VALUES
-- Tarifs pour S001 (Étudiants/chercheurs)
('T001', 'S001', 150.00, 'DH', 'Inscription annuelle étudiants/chercheurs', '2025', true),
('T002', 'S001', 200.00, 'DH', 'Inscription semestrielle étudiants/chercheurs', '2025', true),
-- Tarifs pour S002 (Grand public)
('T003', 'S002', 60.00, 'DH', 'Inscription annuelle grand public', '2025', true),
('T004', 'S002', 100.00, 'DH', 'Inscription semestrielle grand public', '2025', true),
-- Tarifs pour S003 (Pass Jeunes)
('T005', 'S003', 30.00, 'DH', 'Pass Jeunes – inscription annuelle', '2025', true),
('T006', 'S003', 50.00, 'DH', 'Pass Jeunes – inscription semestrielle', '2025', true),
-- Tarifs pour I001 (Inscription Étudiants/Chercheurs)
('TI001', 'I001', 150.00, 'DH', 'Inscription annuelle étudiants/chercheurs', '2025', true),
('TI002', 'I001', 200.00, 'DH', 'Inscription annuelle étudiants/chercheurs avec accès premium', '2025', true),
-- Tarifs pour I002 (Inscription Grand Public)
('TI003', 'I002', 60.00, 'DH', 'Inscription annuelle grand public', '2025', true),
('TI004', 'I002', 100.00, 'DH', 'Inscription annuelle grand public avec accès premium', '2025', true),
-- Tarifs pour I003 (Pass Jeunes)
('TI005', 'I003', 30.00, 'DH', 'Pass annuel jeunes', '2025', true);