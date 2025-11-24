-- Ajouter l'actualité sur le discours royal concernant le Sahara
INSERT INTO cms_actualites (
  title_fr,
  title_ar,
  slug,
  chapo_fr,
  chapo_ar,
  body_fr,
  body_ar,
  image_url,
  image_alt_fr,
  image_alt_ar,
  status,
  date_publication,
  published_at,
  category,
  tags
) VALUES (
  'Le Roi annonce la clôture définitive du dossier du Sahara',
  'الملك يعلن عن الإغلاق النهائي لملف الصحراء',
  'le-roi-cloture-definitive-sahara',
  'Le Roi Mohammed VI a adressé ce vendredi un Discours à Son peuple fidèle. Le Souverain a évoqué un « tournant décisif dans l''Histoire du Maroc moderne », déclarant qu''il y aura « un avant et un après 31 octobre 2025 », et consacrant la fin du conflit artificiel du Sahara par l''Initiative d''Autonomie.',
  'وجه الملك محمد السادس خطابا إلى شعبه الوفي. وأشار الملك إلى "منعطف حاسم في تاريخ المغرب الحديث"، معلنا أنه سيكون هناك "ما قبل وما بعد 31 أكتوبر 2025"، وكرس نهاية النزاع المفتعل حول الصحراء من خلال مبادرة الحكم الذاتي.',
  'Ce discours intervient en prélude aux commémorations des cinquantième anniversaire de la Marche Verte et soixante-dixième de l''Indépendance du Maroc. Le Roi a exprimé sa « satisfaction » face à la teneur de la dernière Résolution du Conseil de Sécurité. Le Souverain a affirmé que, « après cinquante ans de sacrifices, nous ouvrons un nouveau chapitre victorieux dans le processus de consécration de la Marocanité du Sahara, destiné à clore définitivement le dossier de ce conflit artificiel » par une solution consensuelle fondée sur l''Initiative d''Autonomie.

Le Roi a souligné qu''il est venu le temps du « Maroc uni qui s''étend de Tanger à Lagouira », dont « nul ne s''avisera de bafouer les droits, ni de transgresser les frontières historiques ».

La dynamique de changement et le soutien international grandissent avec plus de cent pays qui reconnaissent la Marocanité du Sahara et soutiennent l''Initiative Marocaine d''Autonomie comme seule solution possible et réaliste au conflit artificiel.',
  'جاء هذا الخطاب تمهيدا للاحتفال بالذكرى الخمسين للمسيرة الخضراء والذكرى السبعين لاستقلال المغرب. وأعرب الملك عن "ارتياحه" لمضمون قرار مجلس الأمن الأخير. وأكد الملك أنه "بعد خمسين سنة من التضحيات، نفتح فصلا جديدا منتصرا في مسار تكريس مغربية الصحراء، بهدف الإغلاق النهائي لملف هذا النزاع المفتعل" من خلال حل توافقي قائم على مبادرة الحكم الذاتي.

وشدد الملك على أنه حان وقت "المغرب الموحد الممتد من طنجة إلى الكويرة"، والذي "لن يتجرأ أحد على المساس بحقوقه أو تجاوز حدوده التاريخية".',
  'https://h24info.ma/wp-content/uploads/2025/10/Mohammed_VI_sahara.jpg',
  'Mohammed VI, Roi du Maroc',
  'محمد السادس، ملك المغرب',
  'published',
  '2025-10-31',
  NOW(),
  'Actualités Nationales',
  ARRAY['Roi Mohammed VI', 'Sahara', 'Discours Royal', 'Marche Verte', 'Autonomie']
);