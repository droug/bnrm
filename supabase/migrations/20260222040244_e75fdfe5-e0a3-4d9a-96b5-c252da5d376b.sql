
-- Ajouter le service Photocopie
INSERT INTO public.bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale, is_free)
VALUES (
  'SRV-REP-PHOTO',
  'Reproduction',
  'Photocopie',
  'Service de photocopie via les scanner-photocopieurs disponibles sur place. Format A4 : 0.50 DH/page, Format A3 : 1 DH/page.',
  'Tous les usagers',
  'Décision des tarifs des services rendus par la BNRM 2025 - Article 2',
  false
);

-- Ajouter les tarifs associés
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TRF-REP-PHOTO-A4', 'SRV-REP-PHOTO', 0.50, 'MAD', 'Format A4', 'Année 2025', true),
  ('TRF-REP-PHOTO-A3', 'SRV-REP-PHOTO', 1.00, 'MAD', 'Format A3', 'Année 2025', true);
