-- Insérer les pages d'informations pratiques et actualités dans le CMS
INSERT INTO content (title, slug, excerpt, content_body, content_type, status, author_id, tags)
VALUES 
-- Page Informations pratiques
('Informations pratiques', 'informations-pratiques', 
'Horaires d''ouverture, accès et services de la Bibliothèque Nationale du Royaume du Maroc.',
'<h2>Bienvenue à la BNRM</h2>
<p>Retrouvez toutes les informations pratiques pour préparer votre visite à la Bibliothèque Nationale du Royaume du Maroc.</p>

<h3>Horaires d''ouverture</h3>
<p>La bibliothèque est ouverte au public du lundi au samedi. Les horaires varient selon l''espace d''accueil.</p>

<h4>Accueil et Inscription</h4>
<ul>
<li>Lundi au vendredi : 09h - 19h</li>
<li>Samedi : 10h - 16h</li>
</ul>

<h4>Espace grand public</h4>
<ul>
<li>Lundi au vendredi : 09h - 19h</li>
<li>Samedi : 10h - 16h</li>
</ul>

<h4>Espace chercheurs</h4>
<ul>
<li>Lundi au vendredi : 09h - 19h</li>
<li>Samedi : 10h - 16h</li>
<li>Arrêt des communications : 17h30 (12h30 samedi)</li>
<li>Fermé pendant le mois d''août</li>
</ul>

<h3>Adresse</h3>
<p><strong>Bibliothèque Nationale du Royaume du Maroc</strong><br/>
Avenue Ibn Khaldoun, Agdal<br/>
10000 Rabat, Maroc</p>

<h3>Contact</h3>
<ul>
<li>Téléphone : +212 5 37 77 18 00</li>
<li>Email : contact@bnrm.ma</li>
</ul>',
'page', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['horaires', 'accès', 'contact', 'visite']),

-- Actualités (type news)
('Actualités de la BNRM', 'actualites-bnrm', 
'Toutes les actualités et événements de la Bibliothèque Nationale du Royaume du Maroc.',
'<h2>Actualités de la BNRM</h2>
<p>Restez informé des dernières nouvelles, événements et publications de la Bibliothèque Nationale du Royaume du Maroc.</p>',
'page', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['actualités', 'événements', 'publications']),

-- Actualité 1
('La BNRM accueille les directeurs des Archives nationales', 'bnrm-archives-autriche-hongrie',
'Madame Samira El Malizi, Directrice de la BNRM, a reçu les directeurs des Archives nationales d''Autriche et de Hongrie.',
'<h2>La BNRM accueille les directeurs des Archives nationales d''Autriche et de Hongrie</h2>
<p><em>10 septembre 2025</em></p>

<p>Madame Samira El Malizi, Directrice de la Bibliothèque nationale du Royaume du Maroc, a reçu dans la matinée du mercredi 10 septembre 2025 une délégation de haut niveau.</p>

<p>Cette délégation était composée de Monsieur Csaba Szabó, Directeur général des Archives nationales de Hongrie, ainsi que Monsieur Helmut Wohnout, Directeur général des Archives d''État d''Autriche.</p>

<p>Les discussions ont porté sur les opportunités de coopération internationale en matière de préservation et valorisation du patrimoine documentaire.</p>',
'news', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['coopération', 'international', 'archives']),

-- Actualité 2
('4ème Colloque des Réseaux de Bibliothèques Marocaines', 'colloque-bibliotheques-marocaines-2025',
'Sous le thème Vers une transformation numérique des bibliothèques marocaines.',
'<h2>Le 4ème Colloque des Réseaux de Bibliothèques Marocaines</h2>
<p><em>5 septembre 2025</em></p>

<p>Sous le thème <strong>« Vers une transformation numérique des bibliothèques marocaines »</strong>, la BNRM organise son colloque annuel.</p>

<p>Cet événement majeur réunit les professionnels de l''information documentaire du Royaume pour échanger sur les défis et opportunités de la digitalisation.</p>

<p>Le colloque aborde les thématiques suivantes :</p>
<ul>
<li>La numérisation des collections patrimoniales</li>
<li>L''accès aux ressources électroniques</li>
<li>La formation des bibliothécaires aux outils numériques</li>
<li>La coopération inter-bibliothèques</li>
</ul>',
'news', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['colloque', 'numérique', 'bibliothèques']),

-- Actualité 3
('Nouveaux Bouquets Électroniques Disponibles', 'nouveaux-bouquets-electroniques',
'La BNRM enrichit son offre numérique avec de nouvelles ressources scientifiques internationales.',
'<h2>Nouveaux Bouquets Électroniques Disponibles</h2>
<p><em>28 août 2025</em></p>

<p>La BNRM enrichit son offre numérique avec de nouvelles ressources scientifiques internationales.</p>

<p>Plus de <strong>10 000 nouvelles ressources numériques</strong> sont désormais accessibles via nos bouquets électroniques, couvrant les domaines des sciences humaines, sociales et exactes.</p>

<p>Les nouvelles bases de données incluent :</p>
<ul>
<li>JSTOR - Arts & Sciences</li>
<li>ProQuest Dissertations</li>
<li>Web of Science</li>
<li>Scopus</li>
</ul>',
'news', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['ressources', 'numérique', 'bases de données']),

-- Exposition
('Exposition : Manuscrits Andalous du Moyen Âge', 'exposition-manuscrits-andalous',
'Découvrez la richesse du patrimoine manuscrit andalou à travers une exposition exceptionnelle.',
'<h2>Exposition : Manuscrits Andalous du Moyen Âge</h2>
<p><em>Du 20 août au 20 novembre 2025</em></p>

<p>Découvrez la richesse du patrimoine manuscrit andalou à travers une exposition exceptionnelle.</p>

<p>Une sélection de manuscrits rares datant du XIIe au XVe siècle, témoignant de l''âge d''or de la civilisation arabo-andalouse.</p>

<h3>Au programme</h3>
<ul>
<li>Plus de 50 manuscrits originaux exposés</li>
<li>Documents sur la science, la médecine et la philosophie</li>
<li>Calligraphie et enluminures d''époque</li>
<li>Visites guidées tous les samedis</li>
</ul>

<p><strong>Lieu :</strong> Hall principal de la BNRM<br/>
<strong>Horaires :</strong> Du lundi au samedi, 09h - 17h<br/>
<strong>Entrée libre</strong></p>',
'exhibition', 'published', 'efd7b4dd-d636-47dc-a3e5-b15799c243cf', ARRAY['exposition', 'manuscrits', 'andalou', 'patrimoine'])

ON CONFLICT (slug) DO NOTHING;