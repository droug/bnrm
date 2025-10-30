-- Mise à jour des images des manuscrits existants avec les nouvelles images générées

UPDATE manuscripts SET thumbnail_url = '/manuscripts/muqaddima.jpg', updated_at = NOW() 
WHERE title = 'المقدمة';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/aghani.jpg', updated_at = NOW()
WHERE title = 'كتاب الأغاني';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/kitab.jpg', updated_at = NOW()
WHERE title = 'الكتاب';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/ghufran.jpg', updated_at = NOW()
WHERE title = 'رسالة الغفران';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/tawq.jpg', updated_at = NOW()
WHERE title = 'طوق الحمامة';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/1001nights.jpg', updated_at = NOW()
WHERE title = 'ألف ليلة وليلة';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/shifa.jpg', updated_at = NOW()
WHERE title = 'الشفاء';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/tabari.jpg', updated_at = NOW()
WHERE title = 'تاريخ الرسل والملوك';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/kalila.jpg', updated_at = NOW()
WHERE title = 'كليلة ودمنة';

UPDATE manuscripts SET thumbnail_url = '/manuscripts/bukhala.jpg', updated_at = NOW()
WHERE title = 'البخلاء';