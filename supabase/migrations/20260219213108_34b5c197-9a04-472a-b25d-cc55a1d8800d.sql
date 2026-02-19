
-- Inserting the 4 free registration types from the BNRM 2025 decision
INSERT INTO bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale, is_free, usage_limit_per_year)
VALUES
  (
    'SL-HON',
    'Inscription',
    'Carte d''honneur',
    'Sur décision de la Directrice de la BNRM.',
    'Toutes les salles de lecture',
    'Décision Directrice BNRM 2025',
    true,
    NULL
  ),
  (
    'SL-RET',
    'Inscription',
    'Gratuité – Personnels retraités BNRM',
    'Sans condition.',
    'Toutes les salles de lecture',
    'Décision Directrice BNRM 2025',
    true,
    NULL
  ),
  (
    'SL-ENF',
    'Inscription',
    'Enfants du personnel BNRM (actif ou retraité)',
    'Être âgé de 18 ans au moins à la date d''inscription. Accès sur justificatif d''études ou de diplôme de 3ème cycle.',
    'Toutes les salles de lecture, sauf la salle des chercheurs',
    'Décision Directrice BNRM 2025',
    true,
    NULL
  ),
  (
    'SL-PASS',
    'Inscription',
    'Pass journalier',
    'Accordé à toute personne non résidente à la région de Rabat et justifiant d''un âge de 16 ans ou plus.',
    'Accès à toutes les salles de lecture',
    'Décision Directrice BNRM 2025',
    true,
    1
  )
ON CONFLICT (id_service) DO NOTHING;
