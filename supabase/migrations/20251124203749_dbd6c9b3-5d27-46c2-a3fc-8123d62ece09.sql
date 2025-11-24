-- Ajouter l'actualité sur la visite de Madame Samira El Malizi en Turquie
INSERT INTO cms_actualites (
  title_fr,
  title_ar,
  slug,
  chapo_fr,
  chapo_ar,
  body_fr,
  body_ar,
  status,
  date_publication,
  published_at,
  category,
  tags
) VALUES (
  'La Directrice de La Bibliothèque Nationale du Royaume du Maroc, Madame Samira El Malizi en visite à la Bibliothèque Nationale de Turquie',
  'مديرة المكتبة الوطنية للمملكة المغربية، السيدة سميرة الملّيزي في زيارة إلى المكتبة الوطنية التركية',
  'visite-samira-el-malizi-bibliotheque-turquie',
  'Madame Samira El Malizi, la Directrice de la Bibliothèque Nationale du Royaume du Maroc, a effectué le 3 novembre 2025 une visite officielle à la Bibliothèque Nationale de Turquie, où elle a été accueillie par Monsieur Taner BEYOĞLU, Directeur Général.',
  'قامت السيدة سميرة الملّيزي، مديرة المكتبة الوطنية للمملكة المغربية، بزيارة رسمية إلى المكتبة الوطنية التركية في 3 نوفمبر 2025، حيث استقبلها السيد تانر بيوغلو، المدير العام.',
  'Madame Samira El Malizi la Directrice de la Bibliothèque Nationale du Royaume du Maroc a effectué, ce 3 novembre 2025, une visite officielle à la Bibliothèque Nationale de Turquie, où elle a été accueillie par Monsieur Taner BEYOĞLU, Directeur Général.

L''entretien a permis d''esquisser les fondations d''une coopération ambitieuse autour de la valorisation documentaire, de la digitalisation des fonds et du partage d''expertise.

Cette rencontre ouvre une trajectoire de collaboration durable, porteuse d''initiatives concrètes et mutuellement avantageuses entre les deux institutions nationales.',
  'قامت السيدة سميرة الملّيزي، مديرة المكتبة الوطنية للمملكة المغربية، بزيارة رسمية إلى المكتبة الوطنية التركية في 3 نوفمبر 2025، حيث استقبلها السيد تانر بيوغلو، المدير العام.

وقد مكن هذا اللقاء من وضع أسس تعاون طموح حول تثمين الوثائق، ورقمنة المقتنيات، وتبادل الخبرات.

يفتح هذا اللقاء مسارا للتعاون المستدام، حاملا لمبادرات ملموسة ومفيدة للطرفين بين المؤسستين الوطنيتين.',
  'published',
  '2025-11-03',
  NOW(),
  'Coopération Internationale',
  ARRAY['BNRM', 'Samira El Malizi', 'Turquie', 'Coopération', 'Bibliothèque Nationale']
);