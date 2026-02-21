
-- =============================================
-- Services de Reproduction (Article 2)
-- =============================================

-- Service: Reproduction sur microfilm
INSERT INTO public.bnrm_services (id_service, categorie, nom_service, description, public_cible, reference_legale, is_free)
VALUES 
  ('SRV-REP-MF', 'Reproduction', 'Reproduction sur microfilm', 'Reproduction de documents sur microfilm avec un minimum de 100 images', 'Tous publics', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false),
  ('SRV-REP-PAP', 'Reproduction', 'Reproduction sur papier', 'Reproduction sur papier à partir de microfilm, page braille, monographies et périodiques', 'Tous publics', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false),
  ('SRV-REP-NUM', 'Reproduction', 'Reproduction numérique', 'Reproduction numérique de manuscrits, lithographies, livres rares, périodiques et publications institutionnelles', 'Particuliers et Entreprises/Institutionnels', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false),
  ('SRV-REP-COLL', 'Reproduction', 'Reproduction collections spécialisées et audiovisuel', 'Reproduction de collections spécialisées et documents audiovisuels', 'Particuliers et Entreprises/Institutionnels', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false),
  ('SRV-REP-IMP', 'Reproduction', 'Impression à partir de PC', 'Impression de documents à partir des postes informatiques de la BNRM', 'Tous publics', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false),
  ('SRV-REP-CARTE', 'Reproduction', 'Carte de recharge self-reproduction', 'Carte vierge de recharge pour le service de self-reproduction', 'Tous publics', 'Décision des tarifs des services rendus par la BNRM 2025 - Article 2', false)
ON CONFLICT (id_service) DO UPDATE SET
  categorie = EXCLUDED.categorie,
  nom_service = EXCLUDED.nom_service,
  description = EXCLUDED.description,
  public_cible = EXCLUDED.public_cible,
  reference_legale = EXCLUDED.reference_legale,
  updated_at = NOW();

-- =============================================
-- Tarifs de Reproduction
-- =============================================

-- Microfilm
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-MF01', 'SRV-REP-MF', 5.00, 'DH/image', 'Minimum 100 images', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, condition_tarif = EXCLUDED.condition_tarif, updated_at = NOW();

-- Reproduction sur papier
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-PAP01', 'SRV-REP-PAP', 3.00, 'DH/page', 'De microfilm', '2025', true),
  ('TREP-PAP02', 'SRV-REP-PAP', 3.00, 'DH/page', 'De page braille', '2025', true),
  ('TREP-PAP03', 'SRV-REP-PAP', 0.50, 'DH/page', 'Monographies et périodiques - Format A4', '2025', true),
  ('TREP-PAP04', 'SRV-REP-PAP', 1.00, 'DH/page', 'Monographies et périodiques - Format A3', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, condition_tarif = EXCLUDED.condition_tarif, updated_at = NOW();

-- Reproduction numérique - Particuliers (utilisation non commerciale)
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-NUM01', 'SRV-REP-NUM', 2.50, 'DH/page', 'Particuliers - Manuscrits/livres rares sur CD ou clé USB (non commercial)', '2025', true),
  ('TREP-NUM02', 'SRV-REP-NUM', 3.50, 'DH/page', 'Particuliers - Sur papier couleur (non commercial)', '2025', true),
  ('TREP-NUM03', 'SRV-REP-NUM', 2.00, 'DH/page', 'Particuliers - Sur papier noir & blanc (non commercial)', '2025', true),
  -- Entreprises et institutionnels (utilisation commerciale)
  ('TREP-NUM04', 'SRV-REP-NUM', 600.00, 'DH/page', 'Entreprises/Institutionnels - Manuscrits/livres rares sur CD ou clé USB (commercial)', '2025', true),
  ('TREP-NUM05', 'SRV-REP-NUM', 600.00, 'DH/page', 'Entreprises/Institutionnels - Sur papier couleur (commercial)', '2025', true),
  ('TREP-NUM06', 'SRV-REP-NUM', 3.00, 'DH/page', 'Entreprises/Institutionnels - Sur papier noir & blanc (non commercial)', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, condition_tarif = EXCLUDED.condition_tarif, updated_at = NOW();

-- Collections spécialisées et audiovisuel
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-COLL01', 'SRV-REP-COLL', 200.00, 'DH/unité', 'Particuliers - Collections spécialisées (non commercial)', '2025', true),
  ('TREP-COLL02', 'SRV-REP-COLL', 600.00, 'DH/unité', 'Particuliers - Collections spécialisées (commercial)', '2025', true),
  ('TREP-COLL03', 'SRV-REP-COLL', 300.00, 'DH/unité', 'Entreprises/Institutionnels - Collections spécialisées (non commercial)', '2025', true),
  ('TREP-COLL04', 'SRV-REP-COLL', 850.00, 'DH/unité', 'Entreprises/Institutionnels - Collections spécialisées (commercial)', '2025', true),
  ('TREP-COLL05', 'SRV-REP-COLL', 200.00, 'DH/unité', 'Particuliers - Documents audiovisuels (non commercial)', '2025', true),
  ('TREP-COLL06', 'SRV-REP-COLL', 600.00, 'DH/unité', 'Particuliers - Documents audiovisuels (commercial)', '2025', true),
  ('TREP-COLL07', 'SRV-REP-COLL', 300.00, 'DH/unité', 'Entreprises/Institutionnels - Documents audiovisuels (non commercial)', '2025', true),
  ('TREP-COLL08', 'SRV-REP-COLL', 850.00, 'DH/unité', 'Entreprises/Institutionnels - Documents audiovisuels (commercial)', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, condition_tarif = EXCLUDED.condition_tarif, updated_at = NOW();

-- Impression à partir de PC
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-IMP01', 'SRV-REP-IMP', 2.00, 'DH/page', 'Impression à partir de PC', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, updated_at = NOW();

-- Carte de recharge
INSERT INTO public.bnrm_tarifs (id_tarif, id_service, montant, devise, condition_tarif, periode_validite, is_active)
VALUES
  ('TREP-CARTE01', 'SRV-REP-CARTE', 20.00, 'DH/carte', 'Carte vierge de recharge', '2025', true)
ON CONFLICT (id_tarif) DO UPDATE SET montant = EXCLUDED.montant, updated_at = NOW();
