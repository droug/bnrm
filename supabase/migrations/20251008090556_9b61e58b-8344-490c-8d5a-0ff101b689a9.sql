-- Créer les services d'abonnement avec IDs commençant par I
INSERT INTO public.bnrm_services (id_service, nom_service, description, categorie, public_cible, reference_legale) VALUES
('I001', 'Inscription Étudiants/Chercheurs', 'Inscription annuelle pour les étudiants et chercheurs', 'Inscription', 'Étudiants inscrits en cycle supérieur et chercheurs', 'Loi 67-99, Décision du 16/01/2014'),
('I002', 'Inscription Grand Public', 'Inscription annuelle pour le grand public', 'Inscription', 'Grand public', 'Loi 67-99, Décision du 16/01/2014'),
('I003', 'Pass Jeunes', 'Abonnement annuel pour les jeunes', 'Inscription', 'Jeunes de 15 à 25 ans', 'Loi 67-99, Décision du 16/01/2014')
ON CONFLICT (id_service) DO NOTHING;

-- Créer les tarifs pour les abonnements
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active) VALUES
('TI001', 'I001', 150.00, 'DH', 'Inscription annuelle étudiants/chercheurs', '2025', true),
('TI002', 'I001', 200.00, 'DH', 'Inscription annuelle étudiants/chercheurs avec accès premium', '2025', true),
('TI003', 'I002', 60.00, 'DH', 'Inscription annuelle grand public', '2025', true),
('TI004', 'I002', 100.00, 'DH', 'Inscription annuelle grand public avec accès premium', '2025', true),
('TI005', 'I003', 30.00, 'DH', 'Pass annuel jeunes', '2025', true),
('TI006', 'I003', 50.00, 'DH', 'Pass annuel jeunes avec accès premium', '2025', true)
ON CONFLICT (id_tarif) DO NOTHING;