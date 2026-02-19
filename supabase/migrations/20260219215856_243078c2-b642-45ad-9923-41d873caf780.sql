-- Correction de l'intitulé "Personnels retraités de la BNRM"
UPDATE bnrm_services
SET nom_service = 'Personnels retraités de la BNRM',
    updated_at = NOW()
WHERE id_service = 'SL-RET';

-- Ajout de la catégorie manquante "Personnes à besoins spécifiques"
INSERT INTO bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale, is_free, usage_limit_per_year)
VALUES (
  'SL-PBS',
  'Inscription',
  'Personnes à besoins spécifiques',
  'Accès gratuit pour les personnes à besoins spécifiques',
  'Personnes à besoins spécifiques',
  'Décision des tarifs des services rendus par la BNRM 2025',
  true,
  NULL
)
ON CONFLICT (id_service) DO NOTHING;