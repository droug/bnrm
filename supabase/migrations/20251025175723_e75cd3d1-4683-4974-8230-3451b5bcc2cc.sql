-- Insertion d'exemples de nomenclatures de fichiers BNRM
INSERT INTO public.cote_nomenclatures (prefixe, modele_codification, description, module_concerne, is_active) VALUES
('PH2', 'PH2_ED##_VILLE##_###', 'Format Prix Hassan II : édition (ex: ED42), ville (ex: MRK), numéro de dossier (ex: 122)', 'Prix Hassan II', true),
('MAN', 'MAN_COLL##_####', 'Format Manuscrits : code collection (ex: D, J, K) + numéro séquentiel à 4 chiffres', 'Manuscrits', true),
('DOC', 'DOC_VILLE##_AAAA_###', 'Format Documents généraux : ville + année + numéro séquentiel', 'Autres', true),
('ACT', 'ACT_AAAA_MM_VILLE##_##', 'Format Activités culturelles : année + mois + ville + numéro', 'Activités culturelles', true),
('EXPO', 'EXPO_AAAA_###', 'Format Expositions : année + numéro séquentiel', 'Activités culturelles', true)
ON CONFLICT (id) DO NOTHING;