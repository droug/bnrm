-- Mise à jour des images pour les manuscrits historiques à conserver
UPDATE manuscripts SET thumbnail_url = '/manuscripts/leon-africain.jpg', updated_at = NOW()
WHERE title = 'Histoire du Maroc médiéval' AND author = 'Léon l''Africain';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/ibn-zuhr.jpg', updated_at = NOW()
WHERE title = 'Traité de médecine andalouse' AND author = 'Ibn Zuhr';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/amazigh-poetry.jpg', updated_at = NOW()
WHERE title = 'ⴰⵎⴰⵡⴰⵍ ⵏ ⵜⵎⴰⵣⵉⵖⵜ' AND author = 'ⵎⵓⵃⴰⵏⴷ ⵛⴰⵡⵉ';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/ibn-zaidoun.jpg', updated_at = NOW()
WHERE title = 'ديوان الشعر الأندلسي' AND author = 'ابن زيدون' AND created_at > '2025-10-25';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/maziri-fatawa.jpg', updated_at = NOW()
WHERE title = 'Recueil de fatawa malikites' AND author = 'الإمام المازري';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/moulay-ismail.jpg', updated_at = NOW()
WHERE title = 'Correspondances diplomatiques' AND author = 'Sultan Moulay Ismail';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/amazigh-science.jpg', updated_at = NOW()
WHERE title = 'ⴰⵎⴰⵡⴰⵍ ⵏ ⵜⵓⵙⵙⵏⴰ' AND author = 'ⵄⵍⵉ ⵓⵙⴰⵢⴷ';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/astronomy-morocco.jpg', updated_at = NOW()
WHERE title = 'Traité d''astronomie marocaine' AND author = 'محمد بن إبراهيم السوسي';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/foucauld.jpg', updated_at = NOW()
WHERE title = 'Récits de voyageurs au Maghreb' AND author = 'Charles de Foucauld';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/wazzan-geography.jpg', updated_at = NOW()
WHERE title = 'المعجم الجغرافي للمغرب' AND author = 'الحسن الوزان';

-- Masquer les manuscrits doublons et non pertinents au lieu de les supprimer
UPDATE manuscripts SET is_visible = false, updated_at = NOW()
WHERE title IN (
  'مخطوط الأدب العربي القديم',
  'مخطوط الفقه المالكي',
  'Kitab al-Hikmah',
  'Atlas céleste',
  'Diwan de poésie',
  'Livre des Étoiles',
  'Traité de médecine',
  'Recueil de poésie',
  'Chronique de la conquête'
)
OR (title = 'Traité de Médecine Traditionnelle' AND author = 'Ibn Sina (Avicenne)')
OR (title = 'Histoire du Maroc' AND author = 'Ahmed Ibn Khaled')
OR (title = 'ديوان الشعر الأندلسي' AND created_at < '2025-10-25');