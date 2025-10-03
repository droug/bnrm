-- Insertion d'exemples fictifs de collections partenaires
INSERT INTO partner_collections (institution_name, institution_code, contact_person, contact_email, contact_phone, website_url, description, is_approved, created_by)
VALUES 
  ('Bibliothèque Nationale de Tunisie', 'BNT-2024', 'Dr. Ahmed Mansouri', 'a.mansouri@bnt.tn', '+216 71 123 456', 'https://www.bnt.tn', 'Collection de manuscrits andalous et maghrébins', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Institut des Manuscrits Arabes', 'IMA-2024', 'Dr. Fatima Al-Azhari', 'f.azhari@ima.org', '+20 2 123 4567', 'https://www.ima.org', 'Manuscrits scientifiques et philosophiques arabes', true, (SELECT id FROM auth.users LIMIT 1)),
  ('Université Al-Qarawiyyin', 'UAQ-2024', 'Pr. Hassan El-Fassi', 'h.elfassi@uaq.ma', '+212 5 35 12 34 56', 'https://www.uaq.ma', 'Collection de manuscrits religieux et juridiques', false, (SELECT id FROM auth.users LIMIT 1)),
  ('Fondation du Roi Abdul Aziz', 'FKAA-2024', 'Dr. Sarah Abdullah', 's.abdullah@fkaa.sa', '+966 11 234 5678', 'https://www.fkaa.sa', 'Manuscrits historiques du monde islamique', false, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (institution_code) DO NOTHING;

-- Insertion d'exemples de soumissions de manuscrits
INSERT INTO partner_manuscript_submissions (
  collection_id, 
  title, 
  author, 
  description, 
  language, 
  period, 
  material,
  dimensions,
  condition_notes,
  inventory_number,
  page_count,
  metadata,
  submission_status,
  submitted_by
)
SELECT 
  pc.id,
  'Kitab al-Manazir (Le Livre de l''Optique)',
  'Ibn al-Haytham',
  'Traité fondamental sur l''optique et la vision, écrit au XIe siècle',
  'arabe',
  'XIe siècle',
  'Papier oriental',
  '24 x 18 cm',
  'Bon état général',
  'BNT-MS-001',
  247,
  jsonb_build_object('note', 'Manuscrit de référence en optique médiévale'),
  'approved',
  (SELECT created_by FROM partner_collections WHERE institution_code = 'BNT-2024')
FROM partner_collections pc
WHERE pc.institution_code = 'BNT-2024'
AND NOT EXISTS (SELECT 1 FROM partner_manuscript_submissions WHERE inventory_number = 'BNT-MS-001')
LIMIT 1;

INSERT INTO partner_manuscript_submissions (
  collection_id, 
  title, 
  author, 
  description, 
  language, 
  period, 
  material,
  dimensions,
  condition_notes,
  inventory_number,
  page_count,
  metadata,
  submission_status,
  submitted_by
)
SELECT 
  pc.id,
  'Kitab al-Jabr wa-l-Muqabala',
  'Al-Khwarizmi',
  'Premier traité d''algèbre systématique en arabe',
  'arabe',
  'IXe siècle',
  'Parchemin',
  '28 x 20 cm',
  'Excellent état',
  'IMA-MS-042',
  189,
  jsonb_build_object('note', 'Fondateur de l''algèbre moderne'),
  'pending',
  (SELECT created_by FROM partner_collections WHERE institution_code = 'IMA-2024')
FROM partner_collections pc
WHERE pc.institution_code = 'IMA-2024'
AND NOT EXISTS (SELECT 1 FROM partner_manuscript_submissions WHERE inventory_number = 'IMA-MS-042')
LIMIT 1;