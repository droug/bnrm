-- Mettre à jour les pages avec du contenu réel extrait du site bnrm.ma

-- Page: Horaires d'ouverture
UPDATE public.content SET content_body = '<h2>Horaires d''ouverture</h2>
<p>La bibliothèque est ouverte au public du lundi au samedi. Les horaires varient selon l''espace d''accueil. La BNRM peut être amenée à les modifier temporairement en cours d''année afin d''organiser les opérations de traitement de ses collections. Toute fermeture exceptionnelle sera signalée à l''avance.</p>

<h3>Accueil et Inscription</h3>
<p><strong>Horaires d''ouverture:</strong></p>
<ul>
<li>Du lundi au vendredi : 09h - 19h</li>
<li>Samedi: 10h - 16h</li>
</ul>
<p><strong>Horaires de Ramadan:</strong></p>
<ul>
<li>Du lundi au vendredi: 09h - 17h</li>
<li>Samedi: de 10h à 14h</li>
</ul>

<h3>Espace grand public</h3>
<p><strong>Les horaires d''ouverture:</strong></p>
<ul>
<li>Du lundi au vendredi : 09h à 19h</li>
<li>Samedi : 10h à 16h</li>
</ul>

<h3>Espace chercheurs</h3>
<p><strong>Les horaires d''ouverture:</strong></p>
<ul>
<li>Du lundi au vendredi : 09h à 19h</li>
<li>Samedi : 10h à 16h</li>
</ul>
<p><strong>Arrêt des communications:</strong> 17h30 (Samedi 15h30)</p>
<p>Fermé pendant le mois d''août</p>

<h3>Espace collections spécialisées</h3>
<p>Fermé Samedi.</p>
<p><strong>Arrêt des communications:</strong> 15h30</p>
<p>Horaires de Ramadan : de 09h à 15h du lundi au vendredi.</p>
<p>Fermé pendant le mois d''août.</p>

<h3>Espaces audiovisuels et malvoyants</h3>
<p>Fermé Samedi.</p>
<p><strong>Arrêt des communications:</strong> 15h30</p>
<p>Horaires de Ramadan : de 09h à 15h du lundi au vendredi.</p>
<p>Fermé pendant le mois d''août.</p>

<h3>Site Ibn Batouta</h3>
<p>Fermé Samedi.</p>
<p><strong>Arrêt des communications:</strong> 15h30</p>
<p>Horaires de Ramadan : de 09h à 15h du lundi au vendredi.</p>
<p>Horaires d''été : de 08h30 à 16h30 du lundi au vendredi.</p>
<p>Fermé pendant le mois d''août.</p>',
excerpt = 'La bibliothèque est ouverte au public du lundi au samedi. Les horaires varient selon l''espace d''accueil.',
status = 'published'
WHERE slug = 'horaires-ouverture';

-- Page: Programmation culturelle
UPDATE public.content SET content_body = '<h2>Programmation culturelle</h2>
<p>La Bibliothèque Nationale du Royaume du Maroc organise régulièrement des activités culturelles variées pour promouvoir la lecture, la recherche et le patrimoine culturel marocain.</p>

<h3>Nos activités</h3>
<ul>
<li><strong>Rencontres et débats</strong> - Conférences scientifiques, tables rondes et discussions avec des chercheurs et intellectuels</li>
<li><strong>Présentations d''ouvrages</strong> - Séances de signature et présentations de nouvelles publications</li>
<li><strong>Expositions</strong> - Expositions thématiques valorisant le patrimoine documentaire</li>
<li><strong>Activités artistiques</strong> - Spectacles, concerts et performances artistiques</li>
</ul>

<h3>Événements récents</h3>
<p>La BNRM a récemment organisé le <strong>Bazaar diplomatique</strong> présidé par SAR la Princesse Lalla Meryem, ainsi que des expositions commémorant le 50ème anniversaire de la Marche Verte.</p>

<p>Pour plus d''informations sur notre programmation, consultez notre <a href="/agenda">agenda culturel</a> ou suivez-nous sur les réseaux sociaux.</p>',
excerpt = 'Découvrez les activités culturelles de la BNRM : conférences, expositions, présentations d''ouvrages et événements artistiques.',
status = 'published'
WHERE slug = 'programmation-culturelle';

-- Page: Organigramme
UPDATE public.content SET content_body = '<h2>Organigramme de la BNRM</h2>
<p>La Bibliothèque Nationale du Royaume du Maroc est dirigée par <strong>Madame Samira El Malizi</strong>, Directrice de la BNRM.</p>

<h3>Direction</h3>
<p>La Direction assure la gestion stratégique de l''établissement et veille à l''accomplissement des missions de la bibliothèque.</p>

<h3>Divisions principales</h3>
<ul>
<li><strong>Division des Collections</strong> - Gestion, conservation et enrichissement du fonds documentaire</li>
<li><strong>Division des Services aux Usagers</strong> - Accueil, orientation et services aux lecteurs</li>
<li><strong>Division de la Numérisation</strong> - Programmes de numérisation du patrimoine</li>
<li><strong>Division Administrative et Financière</strong> - Gestion des ressources</li>
<li><strong>Agence Bibliographique Nationale</strong> - ISBN, ISSN et Dépôt légal</li>
</ul>',
excerpt = 'Organisation et structure de la Bibliothèque Nationale du Royaume du Maroc.',
status = 'published'
WHERE slug = 'organigramme';

-- Page: Histoire
UPDATE public.content SET content_body = '<h2>Histoire de la Bibliothèque Nationale</h2>
<p>La Bibliothèque Nationale du Royaume du Maroc (BNRM) est l''héritière de la Bibliothèque Générale créée en 1920. Elle constitue aujourd''hui la mémoire écrite du Maroc.</p>

<h3>Les grandes dates</h3>
<ul>
<li><strong>1920</strong> - Création de la Bibliothèque Générale</li>
<li><strong>1941</strong> - Visite de Sa Majesté le Roi Mohammed V</li>
<li><strong>2008</strong> - Inauguration du nouveau siège par Sa Majesté le Roi Mohammed VI</li>
</ul>

<h3>Missions</h3>
<p>La BNRM a pour missions principales :</p>
<ul>
<li>La collecte et la conservation du patrimoine documentaire national</li>
<li>La gestion du dépôt légal</li>
<li>L''attribution des numéros ISBN et ISSN</li>
<li>L''élaboration de la bibliographie nationale</li>
<li>La mise à disposition des collections au public</li>
</ul>',
excerpt = 'Découvrez l''histoire de la Bibliothèque Nationale du Royaume du Maroc, de 1920 à nos jours.',
status = 'published'
WHERE slug = 'histoire';

-- Page: Mot de la Direction
UPDATE public.content SET content_body = '<h2>Mot de la Direction</h2>
<p>Bienvenue à la Bibliothèque Nationale du Royaume du Maroc.</p>

<p>La BNRM, gardienne du patrimoine documentaire national, s''engage à préserver et valoriser la mémoire écrite du Maroc tout en offrant des services modernes et accessibles à tous les usagers.</p>

<p>Notre institution poursuit sa mission de collecte, conservation et diffusion du savoir, tout en s''adaptant aux évolutions technologiques et aux attentes de nos publics.</p>

<p>Nous vous invitons à découvrir nos collections, nos services et notre programmation culturelle riche et variée.</p>

<p><strong>Madame Samira El Malizi</strong><br/>Directrice de la Bibliothèque Nationale du Royaume du Maroc</p>',
excerpt = 'Message de Madame Samira El Malizi, Directrice de la Bibliothèque Nationale du Royaume du Maroc.',
status = 'published'
WHERE slug = 'mot-direction';

-- Page: Nos expositions
UPDATE public.content SET content_body = '<h2>Nos expositions</h2>
<p>La Bibliothèque Nationale du Royaume du Maroc organise régulièrement des expositions thématiques valorisant le patrimoine documentaire national et international.</p>

<h3>Exposition en cours</h3>
<p><strong>De la Marche Verte aux Marches du Développement</strong></p>
<p>À l''occasion du 50ème anniversaire de la Marche Verte, la Direction des Documents Royaux et la BNRM présentent une exposition documentaire exceptionnelle.</p>
<p>Du 10 novembre au 10 décembre 2025 - Espace de la Bibliothèque Nationale</p>

<h3>Expositions passées</h3>
<p>Consultez notre archives pour découvrir les expositions précédentes organisées par la BNRM.</p>',
excerpt = 'Expositions actuelles et passées de la Bibliothèque Nationale du Royaume du Maroc.',
status = 'published'
WHERE slug = 'expositions';

-- Page: Agenda
UPDATE public.content SET content_body = '<h2>Agenda culturel</h2>
<p>Découvrez les prochains événements de la Bibliothèque Nationale du Royaume du Maroc.</p>

<h3>Événements à venir</h3>
<p>Consultez régulièrement cette page pour être informé des conférences, expositions, présentations d''ouvrages et autres activités culturelles.</p>

<p>Pour plus d''informations, contactez le service culturel de la BNRM.</p>',
excerpt = 'Calendrier des événements et activités culturelles de la BNRM.',
status = 'published'
WHERE slug = 'agenda';

-- Page: Ils parlent de nous
UPDATE public.content SET content_body = '<h2>Ils parlent de nous</h2>
<p>La Bibliothèque Nationale du Royaume du Maroc dans les médias et publications.</p>

<h3>Actualités récentes</h3>
<p>La Directrice de la BNRM, Madame Samira El Malizi, a participé aux travaux du 36ème Congrès de l''Union Arabe des Bibliothèques et de l''Information à Doha (23-25 novembre 2025).</p>

<p>La BNRM a également été le lieu d''accueil du Bazaar diplomatique 2025, inauguré par SAR la Princesse Lalla Meryem.</p>',
excerpt = 'La BNRM dans les médias et publications.',
status = 'published'
WHERE slug = 'ils-parlent-de-nous';

-- Autres pages
UPDATE public.content SET 
content_body = '<h2>Visites virtuelles</h2><p>Explorez la Bibliothèque Nationale du Royaume du Maroc depuis chez vous grâce à nos visites virtuelles interactives.</p><p>Découvrez nos espaces de lecture, nos collections spécialisées et notre architecture moderne inaugurée en 2008 par Sa Majesté le Roi Mohammed VI.</p>',
excerpt = 'Explorez la BNRM depuis chez vous grâce aux visites virtuelles.',
status = 'published'
WHERE slug = 'visites-virtuelles';

UPDATE public.content SET 
content_body = '<h2>Nos donateurs</h2><p>La Bibliothèque Nationale du Royaume du Maroc remercie tous les donateurs qui contribuent à enrichir ses collections.</p><p>Grâce à leur générosité, la BNRM peut préserver et transmettre le patrimoine documentaire aux générations futures.</p>',
excerpt = 'Liste des donateurs qui contribuent à enrichir les collections de la BNRM.',
status = 'published'
WHERE slug = 'donateurs';