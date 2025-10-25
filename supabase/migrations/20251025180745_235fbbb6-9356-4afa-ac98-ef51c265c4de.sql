-- Mise à jour des exemples de nomenclatures avec les bons formats
DELETE FROM public.cote_nomenclatures WHERE prefixe IN ('PH2', 'MAN', 'DOC', 'ACT', 'EXPO');

INSERT INTO public.cote_nomenclatures (prefixe, modele_codification, description, module_concerne, is_active) VALUES
('PH2', 'PH2_ED##_VILLE##_###', 'Prix Hassan II - Édition + Ville + Numéro. Exemple: PH2_ED42_MRK_122 (42e édition, Marrakech, dossier 122)', 'Prix Hassan II', true),
('MAN', 'MAN_COLL##_####', 'Manuscrits - Code collection + Numéro. Exemple: MAN_D_0145 (Collection D-Dakhira, manuscrit 145)', 'Manuscrits', true),
('DOC', 'DOC_VILLE##_AAAA_###', 'Documents - Ville + Année + Numéro. Exemple: DOC_RBT_2024_089 (Rabat, année 2024, document 89)', 'Autres', true),
('ACT', 'ACT_AAAA_MM_VILLE##_##', 'Activités - Année + Mois + Ville + Numéro. Exemple: ACT_2024_06_FES_12 (Juin 2024, Fès, activité 12)', 'Activités culturelles', true),
('EXPO', 'EXPO_AAAA_###', 'Expositions - Année + Numéro. Exemple: EXPO_2024_025 (Année 2024, exposition 25)', 'Activités culturelles', true);