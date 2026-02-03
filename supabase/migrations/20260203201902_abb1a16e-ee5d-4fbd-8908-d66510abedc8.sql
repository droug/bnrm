-- Mise à jour des descriptions des bouquets électroniques existants
UPDATE electronic_bundles SET 
  description = 'Revues et ouvrages en sciences humaines et sociales francophones',
  description_ar = 'مجلات وكتب في العلوم الإنسانية والاجتماعية الفرنكوفونية'
WHERE LOWER(provider) = 'cairn';

UPDATE electronic_bundles SET 
  description = 'Base de données multidisciplinaire avec des milliers de revues académiques internationales',
  description_ar = 'قاعدة بيانات متعددة التخصصات مع آلاف المجلات الأكاديمية الدولية'
WHERE LOWER(provider) = 'ebsco';

UPDATE electronic_bundles SET 
  description = 'Éditeur académique spécialisé en études orientales, religion et histoire',
  description_ar = 'ناشر أكاديمي متخصص في الدراسات الشرقية والدين والتاريخ'
WHERE LOWER(provider) = 'brill';

UPDATE electronic_bundles SET 
  description = 'Plateforme de ressources numériques en langue arabe couvrant tous les domaines du savoir',
  description_ar = 'منصة موارد رقمية باللغة العربية تغطي جميع مجالات المعرفة'
WHERE LOWER(provider) = 'almanhal';

UPDATE electronic_bundles SET 
  description = 'Formation en informatique et technologies numériques avec des cours interactifs',
  description_ar = 'تدريب في تكنولوجيا المعلومات والتقنيات الرقمية مع دورات تفاعلية'
WHERE LOWER(provider) LIKE 'eni%';