-- Insérer des exemples de catégories générales
INSERT INTO public.bnrm_categories_generales (code, libelle, description) VALUES
('CAT_ART', 'Arts et Culture', 'Catégorie pour les activités artistiques et culturelles'),
('CAT_CONF', 'Conférences', 'Conférences et séminaires académiques'),
('CAT_EXPO', 'Expositions', 'Expositions temporaires et permanentes'),
('CAT_FORM', 'Formations', 'Sessions de formation et ateliers pédagogiques'),
('CAT_JEUNE', 'Jeunesse', 'Activités destinées au jeune public'),
('CAT_MUSIC', 'Musique', 'Concerts et événements musicaux'),
('CAT_PATRI', 'Patrimoine', 'Valorisation du patrimoine culturel'),
('CAT_LITT', 'Littérature', 'Rencontres littéraires et clubs de lecture'),
('CAT_CINÉ', 'Cinéma', 'Projections cinématographiques et débats'),
('CAT_NUM', 'Numérique', 'Médiation numérique et culture digitale')
ON CONFLICT (code) DO NOTHING;