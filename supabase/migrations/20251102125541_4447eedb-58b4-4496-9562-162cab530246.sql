-- Insertion d'exemples de demandes de restauration
INSERT INTO public.restoration_requests (
  user_id,
  manuscript_title,
  manuscript_cote,
  damage_description,
  urgency_level,
  status,
  user_notes,
  submitted_at
) VALUES 
-- Demande soumise (nouvelle)
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مخطوط تفسير القرآن الكريم',
  'MS-AR-2024-001',
  'تلف في الغلاف الخارجي وتآكل في الأوراق الأولى بسبب الرطوبة. بعض الصفحات منفصلة عن الكتاب.',
  'elevee',
  'soumise',
  'مخطوط نادر يحتاج إلى تدخل عاجل للحفاظ عليه',
  NOW() - INTERVAL '2 days'
),
-- En attente d'autorisation
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'ديوان شعري من القرن 18',
  'MS-AR-2024-045',
  'تمزقات كبيرة في عدة صفحات، حبر باهت يصعب قراءته. الجلد متآكل بشدة.',
  'critique',
  'en_attente_autorisation',
  'يحتاج إلى ترميم شامل وإعادة تجليد',
  NOW() - INTERVAL '5 days'
),
-- Autorisée
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مخطوط في الفقه المالكي',
  'MS-AR-2023-078',
  'تلف طفيف في الهوامش، بعض البقع على الصفحات الأخيرة.',
  'moyenne',
  'autorisee',
  'حالة جيدة نسبياً',
  NOW() - INTERVAL '10 days'
),
-- Œuvre reçue
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'كتاب تاريخ الأندلس',
  'MS-AR-2023-156',
  'انفصال الأوراق عن الخيوط، تلف في الجلد المغربي التقليدي.',
  'elevee',
  'oeuvre_recue',
  'تم استلام المخطوط بحالة جيدة',
  NOW() - INTERVAL '15 days'
),
-- Diagnostic en cours
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مجموع في الحديث النبوي',
  'MS-AR-2023-089',
  'تآكل في الحواف، بقع ماء على عدة صفحات، حبر متلاشي في بعض المواضع.',
  'elevee',
  'diagnostic_en_cours',
  'يتطلب تقييم دقيق للأضرار',
  NOW() - INTERVAL '20 days'
),
-- Devis en attente
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مخطوط في علم الفلك',
  'MS-AR-2022-234',
  'تمزقات متعددة، فقدان أجزاء من الصفحات، تلف شديد في التجليد.',
  'critique',
  'devis_en_attente',
  'حالة حرجة تحتاج تدخل متخصص',
  NOW() - INTERVAL '25 days'
),
-- Devis accepté
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'ديوان المتنبي - نسخة أثرية',
  'MS-AR-2022-012',
  'ضعف في الورق، تآكل في الأطراف، بعض الصفحات منفصلة.',
  'moyenne',
  'devis_accepte',
  'الديوان في حالة تتطلب ترميم متوسط',
  NOW() - INTERVAL '30 days'
),
-- Paiement validé
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مخطوط في الطب',
  'MS-AR-2022-167',
  'تلف في الجلد، بعض الصفحات متضررة من الحشرات.',
  'faible',
  'paiement_valide',
  'جاهز للبدء في الترميم',
  NOW() - INTERVAL '35 days'
),
-- Restauration en cours
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'كتاب في علم الكلام',
  'MS-AR-2021-345',
  'تمزقات في عدة صفحات، ضعف في الخيوط، تلف في الغلاف.',
  'moyenne',
  'restauration_en_cours',
  'الترميم يسير بشكل جيد',
  NOW() - INTERVAL '45 days'
),
-- Terminée
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'مخطوط قرآني مزخرف',
  'MS-AR-2021-089',
  'تلف طفيف في الزخارف الذهبية، بعض البهتان في الألوان.',
  'elevee',
  'terminee',
  'تم الانتهاء من الترميم بنجاح',
  NOW() - INTERVAL '60 days'
),
-- Clôturée
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'ديوان شعري مغربي',
  'MS-AR-2021-234',
  'تمزقات بسيطة، بعض البقع على الهوامش.',
  'faible',
  'cloturee',
  'تمت الاستعادة والإرجاع للمالك',
  NOW() - INTERVAL '90 days'
),
-- Refusée
(
  'c80e9311-8a9c-489c-8d6e-f9c2d589c41f',
  'كتاب في النحو والصرف',
  'MS-AR-2024-067',
  'تلف شديد جداً يصعب معالجته.',
  'critique',
  'refusee_direction',
  'الحالة لا تسمح بالترميم',
  NOW() - INTERVAL '8 days'
)
ON CONFLICT (id) DO NOTHING;