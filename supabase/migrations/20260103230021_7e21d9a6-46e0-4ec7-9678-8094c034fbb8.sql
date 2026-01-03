-- Insertion des pages extraites du site bnrm.ma comme pages dynamiques dans le CMS
INSERT INTO public.content (title, slug, excerpt, content_body, content_type, status, author_id, tags, is_featured, view_count)
VALUES 
-- Section Bibliothèque
('À propos de la BNRM', 'a-propos-bnrm', 'Découvrez l''histoire et les missions de la Bibliothèque Nationale du Royaume du Maroc', 'Bienvenue à la Bibliothèque Nationale du Royaume du Maroc. Fondée pour préserver et promouvoir le patrimoine documentaire national, la BNRM est une institution culturelle majeure.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['bibliothèque', 'histoire', 'bnrm'], false, 0),

('Histoire de la bibliothèque', 'histoire', 'L''histoire de la Bibliothèque Nationale du Royaume du Maroc depuis sa création', 'Découvrez l''histoire riche de la Bibliothèque Nationale du Royaume du Maroc, ses missions et ses valeurs.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['histoire', 'patrimoine'], false, 0),

('Mot de la Direction', 'mot-direction', 'Message du directeur de la BNRM', 'Message officiel de la direction de la Bibliothèque Nationale du Royaume du Maroc concernant la vision et les objectifs de l''institution.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['direction', 'message'], false, 0),

('Organigramme', 'organigramme', 'Structure organisationnelle de la BNRM', 'Découvrez la structure organisationnelle de la Bibliothèque Nationale du Royaume du Maroc et ses différents départements.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['organisation', 'structure'], false, 0),

('Nos collections', 'nos-collections', 'Les collections de la Bibliothèque Nationale', 'Explorez les riches collections de la BNRM: manuscrits, ouvrages imprimés, périodiques, documents audiovisuels et ressources numériques.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['collections', 'patrimoine', 'manuscrits'], false, 0),

('Coopération', 'cooperation', 'Partenariats et coopération internationale de la BNRM', 'La BNRM entretient des relations de coopération avec de nombreuses institutions nationales et internationales.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['coopération', 'partenariat', 'international'], false, 0),

-- Section Informations pratiques
('Horaires d''ouverture', 'horaires-ouverture', 'Les horaires d''ouverture de la BNRM', 'Consultez les horaires d''ouverture de la Bibliothèque Nationale du Royaume du Maroc et planifiez votre visite.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['horaires', 'accès', 'visite'], false, 0),

('Plan d''accès', 'plan-acces', 'Comment accéder à la BNRM', 'Retrouvez toutes les informations pour accéder facilement à la Bibliothèque Nationale du Royaume du Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['accès', 'transport', 'localisation'], false, 0),

('Espaces de la BNRM', 'espaces-bnrm', 'Les différents espaces de la bibliothèque', 'Découvrez les différents espaces de lecture, de recherche et d''activités culturelles de la BNRM.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['espaces', 'salles', 'lecture'], false, 0),

('Règlement du bon usager', 'reglement-usager', 'Règles d''utilisation de la bibliothèque', 'Le règlement intérieur de la BNRM pour une utilisation optimale des services et des espaces.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['règlement', 'usager', 'règles'], false, 0),

('Formation usager', 'formation-usager', 'Formations proposées aux usagers', 'La BNRM propose des formations pour aider les usagers à utiliser efficacement les ressources de la bibliothèque.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['formation', 'usager', 'aide'], false, 0),

('Services aux publics à besoins spécifiques', 'services-besoins-specifiques', 'Accessibilité et services adaptés', 'La BNRM offre des services adaptés aux personnes à besoins spécifiques pour garantir l''accès à tous.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['accessibilité', 'handicap', 'services'], false, 0),

-- Section Activités culturelles
('Programmation culturelle', 'programmation-culturelle', 'Nos activités et événements culturels', 'Découvrez la programmation culturelle de la BNRM: conférences, expositions, rencontres littéraires et plus encore.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['culture', 'programmation', 'événements'], false, 0),

('Agenda', 'agenda', 'Calendrier des événements', 'Retrouvez tous les événements à venir à la Bibliothèque Nationale du Royaume du Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['agenda', 'calendrier', 'événements'], false, 0),

('Nos expositions', 'expositions', 'Expositions actuelles et passées', 'Découvrez les expositions organisées par la BNRM mettant en valeur le patrimoine documentaire national.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['expositions', 'art', 'patrimoine'], false, 0),

('Rencontres et débats', 'rencontres-debats', 'Conférences et débats à la BNRM', 'La BNRM organise régulièrement des rencontres et débats autour de thématiques culturelles et scientifiques.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['rencontres', 'débats', 'conférences'], false, 0),

('Présentations d''ouvrages', 'presentations-ouvrages', 'Présentations de livres et ouvrages', 'Assistez aux présentations d''ouvrages organisées à la BNRM avec des auteurs et chercheurs.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['livres', 'auteurs', 'présentations'], false, 0),

('Activités artistiques', 'activites-artistiques', 'Événements artistiques à la BNRM', 'Concerts, performances et autres activités artistiques organisées à la bibliothèque.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['art', 'musique', 'performances'], false, 0),

('Presse', 'presse', 'La BNRM dans les médias', 'Retrouvez les articles de presse et couvertures médiatiques concernant la BNRM.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['presse', 'médias', 'actualités'], false, 0),

('Ils parlent de nous', 'ils-parlent-de-nous', 'La BNRM dans les médias et publications', 'Découvrez ce que les médias et publications disent de la Bibliothèque Nationale du Royaume du Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['presse', 'témoignages', 'médias'], false, 0),

-- Section Agence Bibliographique
('Présentation Agence Bibliographique', 'agence-bibliographique', 'L''Agence Bibliographique Nationale', 'L''Agence Bibliographique Nationale est chargée de l''attribution des numéros ISBN et ISSN ainsi que de la gestion du dépôt légal.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['agence', 'bibliographique', 'isbn', 'issn'], false, 0),

('Numéros ISBN et ISSN', 'numeros-isbn-issn', 'Attribution des numéros ISBN et ISSN', 'Informations sur l''attribution des numéros ISBN pour les livres et ISSN pour les publications périodiques au Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['isbn', 'issn', 'édition'], false, 0),

('Bibliographie nationale marocaine', 'bibliographie-nationale', 'La Bibliographie Nationale du Maroc', 'La Bibliographie Nationale Marocaine recense l''ensemble des publications éditées au Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['bibliographie', 'publications', 'maroc'], false, 0),

-- Autres pages
('Visites virtuelles', 'visites-virtuelles', 'Explorez la bibliothèque en ligne', 'Profitez d''une visite virtuelle immersive de la Bibliothèque Nationale du Royaume du Maroc depuis chez vous.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['visite', 'virtuelle', '360'], false, 0),

('Nos donateurs', 'donateurs', 'Hommage à nos donateurs', 'La BNRM remercie ses généreux donateurs qui contribuent à enrichir ses collections.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['donateurs', 'mécénat', 'dons'], false, 0),

('Galerie', 'galerie', 'Galerie photos et vidéos', 'Retrouvez les photos et vidéos des événements et espaces de la BNRM.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['galerie', 'photos', 'vidéos'], false, 0),

('Avis', 'avis', 'Avis et annonces officiels', 'Retrouvez les avis et annonces officiels de la Bibliothèque Nationale du Royaume du Maroc.', 'page', 'draft', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['avis', 'annonces', 'officiel'], false, 0)

ON CONFLICT (slug) DO NOTHING;