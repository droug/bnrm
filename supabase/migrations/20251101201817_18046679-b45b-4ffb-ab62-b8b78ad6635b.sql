-- Insérer le service "Pass journalier" dans la table bnrm_services
INSERT INTO bnrm_services (
  id_service,
  nom_service,
  categorie,
  description,
  public_cible,
  reference_legale
) VALUES (
  'SRV-PASS-JOUR',
  'Pass journalier',
  'Accès',
  'Pass donnant accès illimité à la bibliothèque nationale pour une journée. Ce pass permet l''accès à toutes les salles de lecture, aux espaces de travail, et aux ressources documentaires disponibles sur place.',
  'Grand public, Étudiants, Chercheurs, Visiteurs',
  'Règlement intérieur de la BNRM - Article 5'
);

-- Insérer les tarifs associés au pass journalier
INSERT INTO bnrm_tarifs (
  id_tarif,
  id_service,
  montant,
  devise,
  condition_tarif,
  periode_validite,
  is_active
) VALUES
(
  'TARIF-PASS-JOUR-STANDARD',
  'SRV-PASS-JOUR',
  50.00,
  'MAD',
  'Tarif standard - Accès journalier complet',
  '1 jour',
  true
),
(
  'TARIF-PASS-JOUR-ETUDIANT',
  'SRV-PASS-JOUR',
  30.00,
  'MAD',
  'Tarif réduit pour étudiants (sur présentation de la carte étudiante)',
  '1 jour',
  true
),
(
  'TARIF-PASS-JOUR-GROUPE',
  'SRV-PASS-JOUR',
  40.00,
  'MAD',
  'Tarif de groupe (minimum 10 personnes)',
  '1 jour',
  true
);