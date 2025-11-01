-- Ajouter des exemples de documents CBN variés
-- Architecture: CBN = catalogue complet BNRM (physique + numérique)

-- Livres imprimés modernes
INSERT INTO cbn_documents (
  cote, title, title_ar, author, author_ar, publisher, publication_place, publication_year,
  pages_count, document_type, support_type, physical_status, is_digitized, access_level,
  subject_headings, keywords, dewey_classification
) VALUES
-- Littérature marocaine
(
  'L-2024-001', 
  'Histoire du Maroc Contemporain', 
  'تاريخ المغرب المعاصر',
  'Ahmed Toufiq', 
  'أحمد التوفيق',
  'Dar Al Alam Al Arabi',
  'Rabat',
  2023,
  450,
  'Livre',
  'Imprimé',
  'bon',
  false,
  'public',
  ARRAY['Histoire', 'Maroc', 'XXe siècle'],
  ARRAY['histoire', 'maroc', 'contemporain'],
  '964.05'
),
(
  'L-2024-002',
  'La Poésie Marocaine Moderne',
  'الشعر المغربي الحديث',
  'Mohammed Bennis',
  'محمد بنيس',
  'Toubkal',
  'Casablanca',
  2022,
  320,
  'Livre',
  'Imprimé',
  'bon',
  false,
  'public',
  ARRAY['Poésie', 'Littérature marocaine', 'Poésie contemporaine'],
  ARRAY['poésie', 'littérature', 'maroc'],
  '892.716'
),
(
  'L-2023-156',
  'Architecture et Urbanisme au Maroc',
  'العمارة والتخطيط الحضري بالمغرب',
  'Hassan Radoine',
  'حسن رضوان',
  'Fondation du Roi Abdul-Aziz',
  'Rabat',
  2023,
  580,
  'Livre',
  'Imprimé',
  'excellent',
  false,
  'public',
  ARRAY['Architecture', 'Urbanisme', 'Patrimoine'],
  ARRAY['architecture', 'urbanisme', 'maroc', 'patrimoine'],
  '720.964'
),

-- Sciences et techniques
(
  'L-2023-089',
  'Énergies Renouvelables au Maroc',
  'الطاقات المتجددة بالمغرب',
  'Driss Zejli',
  'إدريس الزجلي',
  'Publications Universitaires',
  'Rabat',
  2023,
  275,
  'Livre',
  'Imprimé',
  'bon',
  false,
  'public',
  ARRAY['Énergie', 'Développement durable', 'Environnement'],
  ARRAY['energie', 'renouvelable', 'maroc', 'solaire'],
  '333.794'
),

-- Histoire et civilisation
(
  'L-2022-234',
  'Les Dynasties Marocaines',
  'السلالات المغربية',
  'Abdellah Laroui',
  'عبد الله العروي',
  'Centre Culturel Arabe',
  'Casablanca',
  2022,
  650,
  'Livre',
  'Imprimé',
  'bon',
  true,
  'public',
  ARRAY['Histoire', 'Dynasties', 'Civilisation islamique'],
  ARRAY['histoire', 'dynasties', 'maroc', 'almoravides', 'almohades'],
  '964.02'
),

-- Périodiques et revues
(
  'P-2024-001',
  'Revue Marocaine de Recherche Scientifique',
  'المجلة المغربية للبحث العلمي',
  NULL,
  NULL,
  'Ministère de l''Enseignement Supérieur',
  'Rabat',
  2024,
  120,
  'Périodique',
  'Imprimé',
  'excellent',
  false,
  'public',
  ARRAY['Sciences', 'Recherche', 'Périodique trimestriel'],
  ARRAY['sciences', 'recherche', 'revue'],
  '505'
),
(
  'P-2024-002',
  'Bulletin d''Archéologie Marocaine',
  'نشرة الآثار المغربية',
  NULL,
  NULL,
  'Institut National des Sciences de l''Archéologie',
  'Rabat',
  2024,
  85,
  'Périodique',
  'Imprimé',
  'bon',
  false,
  'registered',
  ARRAY['Archéologie', 'Patrimoine', 'Périodique annuel'],
  ARRAY['archéologie', 'patrimoine', 'maroc'],
  '930.105'
),

-- Thèses et mémoires
(
  'T-2023-045',
  'Le Patrimoine Immatériel du Maroc: Étude Anthropologique',
  'التراث غير المادي بالمغرب: دراسة أنثروبولوجية',
  'Sara Benali',
  'سارة بنعلي',
  'Université Mohammed V',
  'Rabat',
  2023,
  385,
  'Thèse',
  'Imprimé',
  'excellent',
  true,
  'registered',
  ARRAY['Anthropologie', 'Patrimoine', 'Culture'],
  ARRAY['patrimoine', 'culture', 'maroc', 'anthropologie'],
  '306.0964'
),

-- Documents gouvernementaux
(
  'D-2024-012',
  'Rapport Annuel du Ministère de la Culture 2023',
  'التقرير السنوي لوزارة الثقافة 2023',
  'Ministère de la Culture',
  'وزارة الثقافة',
  'Ministère de la Culture',
  'Rabat',
  2024,
  156,
  'Document officiel',
  'Imprimé',
  'excellent',
  true,
  'public',
  ARRAY['Administration', 'Culture', 'Rapport annuel'],
  ARRAY['culture', 'ministère', 'rapport', 'maroc'],
  '350.964'
),

-- Ouvrages anciens non-manuscrits
(
  'A-1925-008',
  'Le Maroc d''Autrefois',
  NULL,
  'Georges Hardy',
  NULL,
  'Librairie Orientale et Américaine',
  'Paris',
  1925,
  425,
  'Livre ancien',
  'Imprimé',
  'moyen',
  false,
  'restricted',
  ARRAY['Histoire coloniale', 'Ethnographie', 'Maroc colonial'],
  ARRAY['histoire', 'maroc', 'colonial', 'ethnographie'],
  '964.03'
);

-- Vérification finale
DO $$
DECLARE
  total_cbn INTEGER;
  livres INTEGER;
  periodiques INTEGER;
  manuscrits INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cbn FROM cbn_documents;
  SELECT COUNT(*) INTO livres FROM cbn_documents WHERE document_type = 'Livre';
  SELECT COUNT(*) INTO periodiques FROM cbn_documents WHERE document_type = 'Périodique';
  SELECT COUNT(*) INTO manuscrits FROM cbn_documents WHERE document_type = 'Manuscrit';
  
  RAISE NOTICE '=== CATALOGUE CBN (BNRM) ===';
  RAISE NOTICE 'Total documents: %', total_cbn;
  RAISE NOTICE 'Livres: %', livres;
  RAISE NOTICE 'Périodiques: %', periodiques;
  RAISE NOTICE 'Manuscrits: %', manuscrits;
  RAISE NOTICE 'Autres: %', (total_cbn - livres - periodiques - manuscrits);
END $$;