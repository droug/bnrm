-- Créer le service de Restauration
INSERT INTO bnrm_services (id_service, nom_service, description, categorie, public_cible, reference_legale)
VALUES ('SR001', 'Restauration', 'Service de restauration de documents', 'Restauration', 'Tous publics', 'Tarifs BNRM 2025');

-- Créer le tarif pour la Restauration
INSERT INTO bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES ('TR001', 'SR001', 1500.00, 'DH', 'Pour 1J/H', '2025', true);