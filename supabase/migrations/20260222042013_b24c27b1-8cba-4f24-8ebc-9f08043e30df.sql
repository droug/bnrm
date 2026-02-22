
-- Ajouter les services de location d'espaces
INSERT INTO public.bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale, is_free)
VALUES
  ('SRV-LOC-AUDIT', 'Location espaces', 'Auditorium', 'Location de l''Auditorium pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-CONF', 'Location espaces', 'Salle de conférence', 'Location de la Salle de conférence pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-FORM', 'Location espaces', 'Salle de formation', 'Location de la Salle de formation pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-ANNEX', 'Location espaces', 'Salle de l''annexe', 'Location de la Salle de l''annexe pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-EXPO', 'Location espaces', 'Espace d''exposition', 'Location de l''Espace d''exposition pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-HALL', 'Location espaces', 'Hall d''exposition', 'Location du Hall d''exposition pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-POLY', 'Location espaces', 'Salle polyvalente', 'Location de la Salle polyvalente pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-VIP', 'Location espaces', 'Salle VIP', 'Location de la Salle VIP en demi-journée ou journée complète.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-ESP-S1', 'Location espaces', 'Esplanade Espace S1 (Porte principale/Entrée)', 'Location de l''Esplanade Espace S1 pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-ESP-S2', 'Location espaces', 'Esplanade Espace S2 (Grand escalier)', 'Location de l''Esplanade Espace S2 pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-ESP-S3', 'Location espaces', 'Esplanade Espace S3 (Fontaine)', 'Location de l''Esplanade Espace S3 pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-ESP-S4', 'Location espaces', 'Esplanade Espace S4 (Tramway)', 'Location de l''Esplanade Espace S4 pour une journée ou soirée.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false),
  ('SRV-LOC-TOURNAGE', 'Location espaces', 'Tournages : film, émission, documentaire', 'Location pour tournages de films, émissions ou documentaires.', 'Associations et assimilées / Entreprises privées', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 3', false);

-- Ajouter les tarifs associés (Associations et Entreprises privées)
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  -- Auditorium
  ('TRF-LOC-AUDIT-ASSOC', 'SRV-LOC-AUDIT', 10000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-AUDIT-PRIV', 'SRV-LOC-AUDIT', 15000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Salle de conférence
  ('TRF-LOC-CONF-ASSOC', 'SRV-LOC-CONF', 5000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-CONF-PRIV', 'SRV-LOC-CONF', 8000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Salle de formation
  ('TRF-LOC-FORM-ASSOC', 'SRV-LOC-FORM', 3000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-FORM-PRIV', 'SRV-LOC-FORM', 5000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Salle de l'annexe
  ('TRF-LOC-ANNEX-ASSOC', 'SRV-LOC-ANNEX', 4000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-ANNEX-PRIV', 'SRV-LOC-ANNEX', 6000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Espace d'exposition
  ('TRF-LOC-EXPO-ASSOC', 'SRV-LOC-EXPO', 2500, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-EXPO-PRIV', 'SRV-LOC-EXPO', 4000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Hall d'exposition
  ('TRF-LOC-HALL-ASSOC', 'SRV-LOC-HALL', 3000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-HALL-PRIV', 'SRV-LOC-HALL', 5000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Salle polyvalente
  ('TRF-LOC-POLY-ASSOC', 'SRV-LOC-POLY', 4000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-POLY-PRIV', 'SRV-LOC-POLY', 6000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Salle VIP (demi-journée et journée complète)
  ('TRF-LOC-VIP-ASSOC-DEMI', 'SRV-LOC-VIP', 800, 'MAD', 'Associations et assimilées - Demi-journée', 'Année 2025', true),
  ('TRF-LOC-VIP-ASSOC-JOUR', 'SRV-LOC-VIP', 1500, 'MAD', 'Associations et assimilées - Journée complète', 'Année 2025', true),
  ('TRF-LOC-VIP-PRIV-DEMI', 'SRV-LOC-VIP', 1000, 'MAD', 'Entreprises privées - Demi-journée', 'Année 2025', true),
  ('TRF-LOC-VIP-PRIV-JOUR', 'SRV-LOC-VIP', 2000, 'MAD', 'Entreprises privées - Journée complète', 'Année 2025', true),
  -- Esplanade S1
  ('TRF-LOC-S1-ASSOC', 'SRV-LOC-ESP-S1', 20000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-S1-PRIV', 'SRV-LOC-ESP-S1', 25000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Esplanade S2
  ('TRF-LOC-S2-ASSOC', 'SRV-LOC-ESP-S2', 16000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-S2-PRIV', 'SRV-LOC-ESP-S2', 20000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Esplanade S3
  ('TRF-LOC-S3-ASSOC', 'SRV-LOC-ESP-S3', 14000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-S3-PRIV', 'SRV-LOC-ESP-S3', 18000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Esplanade S4
  ('TRF-LOC-S4-ASSOC', 'SRV-LOC-ESP-S4', 12000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-S4-PRIV', 'SRV-LOC-ESP-S4', 16000, 'MAD', 'Entreprises privées', 'Année 2025', true),
  -- Tournages
  ('TRF-LOC-TOURN-ASSOC', 'SRV-LOC-TOURNAGE', 12000, 'MAD', 'Associations et assimilées', 'Année 2025', true),
  ('TRF-LOC-TOURN-PRIV', 'SRV-LOC-TOURNAGE', 15000, 'MAD', 'Entreprises privées', 'Année 2025', true);
