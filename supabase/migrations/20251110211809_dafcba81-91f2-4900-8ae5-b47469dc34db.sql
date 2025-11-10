-- Insérer le service "Réservation de Box"
INSERT INTO bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale)
VALUES ('S011', 'Location', 'Réservation de Box', 'Réservez un box de travail pour vos recherches à la BNRM. Espaces calmes et équipés.', 'Chercheurs, étudiants, professionnels', 'Décision 2014')
ON CONFLICT (id_service) DO UPDATE SET
  nom_service = EXCLUDED.nom_service,
  description = EXCLUDED.description,
  public_cible = EXCLUDED.public_cible;

-- Insérer les tarifs pour la réservation de box
INSERT INTO bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES ('T021', 'S011', 50, 'DH', 'Location de box par jour', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET
  montant = EXCLUDED.montant,
  condition_tarif = EXCLUDED.condition_tarif,
  is_active = EXCLUDED.is_active;