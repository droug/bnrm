-- Créer la table pour stocker les documents du catalogue CBN
CREATE TABLE IF NOT EXISTS public.cbn_catalog_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT NOT NULL,
  secondary_authors TEXT[],
  year TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publish_place TEXT,
  pages INTEGER,
  isbn TEXT,
  issn TEXT,
  cote TEXT NOT NULL UNIQUE,
  internal_id TEXT,
  support_type TEXT NOT NULL,
  support_status TEXT NOT NULL CHECK (support_status IN ('numerise', 'non_numerise', 'libre_acces')),
  is_free_access BOOLEAN NOT NULL DEFAULT false,
  allow_physical_consultation BOOLEAN DEFAULT true,
  description TEXT,
  summary TEXT,
  table_of_contents TEXT[],
  keywords TEXT[],
  collection TEXT,
  language TEXT,
  physical_description TEXT,
  notice_origin TEXT,
  digital_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_cbn_catalog_title ON public.cbn_catalog_documents USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_cbn_catalog_author ON public.cbn_catalog_documents USING gin(to_tsvector('french', author));
CREATE INDEX IF NOT EXISTS idx_cbn_catalog_cote ON public.cbn_catalog_documents(cote);
CREATE INDEX IF NOT EXISTS idx_cbn_catalog_support_type ON public.cbn_catalog_documents(support_type);
CREATE INDEX IF NOT EXISTS idx_cbn_catalog_keywords ON public.cbn_catalog_documents USING gin(keywords);

-- RLS Policies
ALTER TABLE public.cbn_catalog_documents ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les documents
CREATE POLICY "Tout le monde peut voir les documents du catalogue"
  ON public.cbn_catalog_documents
  FOR SELECT
  TO public
  USING (true);

-- Seuls les admins et bibliothécaires peuvent modifier
CREATE POLICY "Admins et bibliothécaires peuvent gérer les documents"
  ON public.cbn_catalog_documents
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_librarian(auth.uid()))
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_cbn_catalog_documents_updated_at
  BEFORE UPDATE ON public.cbn_catalog_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les données exemples
INSERT INTO public.cbn_catalog_documents (
  id, title, title_ar, author, secondary_authors, year, publisher, publish_place,
  pages, isbn, cote, internal_id, support_type, support_status, is_free_access,
  allow_physical_consultation, description, summary, table_of_contents, keywords,
  collection, language, physical_description, notice_origin, digital_link
) VALUES 
  -- 1. Livre LIBRE D'ACCÈS
  (
    'DOC-2024-001',
    'Histoire de la littérature marocaine moderne',
    'تاريخ الأدب المغربي الحديث',
    'Ahmed Ben Mohammed',
    ARRAY['Fatima El Alaoui', 'Mohammed Bennis'],
    '2023',
    'Éditions Atlas',
    'Rabat',
    342,
    '978-9954-123-456-7',
    '840.MAR.BEN',
    'BNM-2024-001',
    'Livre',
    'libre_acces',
    true,
    true,
    'Cet ouvrage propose une étude approfondie de l''évolution de la littérature marocaine moderne, de l''indépendance à nos jours. Il analyse les principaux courants littéraires, les auteurs majeurs et les thèmes récurrents qui caractérisent cette période riche en productions.',
    'Une analyse complète de l''évolution de la littérature marocaine moderne depuis l''indépendance.',
    ARRAY['Introduction à la littérature marocaine', 'Les courants littéraires post-indépendance', 'Les auteurs majeurs et leurs œuvres', 'Thèmes récurrents et symboles', 'Conclusion et perspectives'],
    ARRAY['Littérature marocaine', 'Histoire littéraire', 'Analyse culturelle', 'Post-indépendance'],
    'Patrimoine Littéraire',
    'Français',
    '342 p. : ill. ; 24 cm',
    'Bibliothèque Nationale du Royaume du Maroc',
    'https://bibliotheque-numerique-bnrm.ma/viewer/DOC-2024-001'
  ),
  -- 2. Manuscrit NUMÉRISÉ
  (
    'DOC-2024-002',
    'Manuscrits enluminés du Maroc médiéval',
    'المخطوطات المزخرفة من المغرب الوسيط',
    'Hassan El Fassi',
    ARRAY['Aïcha Bennani'],
    '2022',
    'Publications de la BNRM',
    'Rabat',
    456,
    '978-9954-234-567-8',
    '091.MAR.ELF',
    'BNM-2022-145',
    'Manuscrit',
    'numerise',
    false,
    false,
    'Catalogue exhaustif des manuscrits enluminés conservés à la Bibliothèque Nationale. Cet ouvrage présente une analyse détaillée de l''art de l''enluminure au Maroc médiéval, avec des reproductions haute résolution de pages exceptionnelles.',
    'Un catalogue complet des manuscrits enluminés du Maroc médiéval avec analyse artistique et historique.',
    ARRAY['Les techniques d''enluminure au Maghreb', 'Les ateliers de Fès et Marrakech', 'Iconographie islamique et symbolisme', 'Conservation et restauration', 'Catalogue des œuvres'],
    ARRAY['Manuscrits', 'Enluminure', 'Art islamique', 'Patrimoine', 'Conservation'],
    'Patrimoine Manuscrit',
    'Français / Arabe',
    '456 p. : ill. en coul. ; 30 cm',
    'Bibliothèque Nationale du Royaume du Maroc',
    'https://bibliotheque-numerique-bnrm.ma/viewer/DOC-2024-002'
  ),
  -- 3. Archives NON NUMÉRISÉES
  (
    'DOC-2023-089',
    'Archives royales du Maroc : Correspondances diplomatiques 1912-1956',
    'الأرشيف الملكي المغربي: المراسلات الدبلوماسية 1912-1956',
    'Mohammed Kenbib',
    NULL,
    '2023',
    'Éditions du Palais Royal',
    'Rabat',
    628,
    '978-9954-345-678-9',
    '327.64.KEN',
    'BNM-2023-089',
    'Archives',
    'non_numerise',
    false,
    true,
    'Recueil de correspondances diplomatiques entre le Maroc et diverses puissances étrangères durant la période du protectorat. Documents d''archives inédits accompagnés d''analyses contextuelles.',
    'Correspondances diplomatiques historiques de la période du protectorat français au Maroc.',
    ARRAY['Contexte historique 1912-1956', 'Relations avec la France', 'Relations avec l''Espagne', 'Relations internationales', 'Index des documents'],
    ARRAY['Archives', 'Diplomatie', 'Protectorat', 'Histoire contemporaine', 'Relations internationales'],
    'Archives Historiques',
    'Français / Arabe',
    '628 p. ; 28 cm + annexes',
    'Bibliothèque Nationale du Royaume du Maroc',
    NULL
  ),
  -- 4. Périodique NUMÉRISÉ
  (
    'PER-2024-015',
    'Revue marocaine d''études juridiques et politiques',
    'المجلة المغربية للدراسات القانونية والسياسية',
    'Collectif',
    NULL,
    '2024',
    'Faculté de Droit - Rabat',
    'Rabat',
    NULL,
    NULL,
    '340.05.REV',
    'PER-2024-015',
    'Périodique',
    'numerise',
    false,
    true,
    'Revue académique trimestrielle consacrée aux études juridiques et politiques au Maroc et dans le monde arabe. Numéro spécial sur les réformes constitutionnelles.',
    'Revue académique trimestrielle - Numéro spécial réformes constitutionnelles.',
    NULL,
    ARRAY['Droit', 'Sciences politiques', 'Constitution', 'Réformes', 'Maroc'],
    'Périodiques Académiques',
    'Français / Arabe',
    'Vol. 45, N°2 (Avril 2024), 256 p.',
    'Bibliothèque Nationale du Royaume du Maroc',
    'https://bibliotheque-numerique-bnrm.ma/periodiques/PER-2024-015'
  ),
  -- 5. CD-ROM
  (
    'MUL-2023-034',
    'Atlas interactif du Maroc : Géographie, Histoire et Culture',
    'أطلس المغرب التفاعلي: الجغرافيا والتاريخ والثقافة',
    'Institut Royal de Géographie',
    NULL,
    '2023',
    'Publications IRG',
    'Rabat',
    NULL,
    '978-9954-456-789-0',
    '916.4.ATL',
    'MUL-2023-034',
    'CD-ROM',
    'non_numerise',
    false,
    true,
    'Atlas multimédia interactif présentant la géographie, l''histoire et la culture marocaine à travers des cartes, des vidéos, des photographies et des documents d''archives.',
    'Atlas interactif multimédia sur CD-ROM couvrant tous les aspects du Maroc.',
    ARRAY['Module Géographie physique', 'Module Histoire dynastique', 'Module Patrimoine culturel', 'Base de données documentaire', 'Galerie multimédia'],
    ARRAY['Atlas', 'Géographie', 'Histoire', 'Culture', 'Multimédia', 'Patrimoine'],
    'Documents Multimédias',
    'Français / Arabe / Anglais',
    '1 CD-ROM + livret 48 p.',
    'Bibliothèque Nationale du Royaume du Maroc',
    NULL
  ),
  -- 6. Livre ancien RARE
  (
    'RAR-1890-001',
    'Description géographique de l''empire de Maroc',
    NULL,
    'Louis de Chénier',
    NULL,
    '1890',
    'Imprimerie Royale',
    'Paris',
    384,
    NULL,
    '916.4.CHE.R',
    'RAR-1890-001',
    'Livre ancien',
    'non_numerise',
    false,
    false,
    'Édition originale rare de la description du Maroc par Louis de Chénier, consul de France. Ouvrage en excellent état avec illustrations gravées d''époque. Consultation uniquement sur place avec autorisation spéciale.',
    'Description historique du Maroc par un consul français du XIXe siècle - Édition originale rare.',
    NULL,
    ARRAY['Livre rare', 'Histoire', 'Géographie historique', 'XIXe siècle', 'Voyages'],
    'Fonds Patrimonial Rare',
    'Français',
    '384 p. : grav. ; 22 cm - Reliure d''époque',
    'Bibliothèque Nationale du Royaume du Maroc',
    NULL
  ),
  -- 7. Thèse LIBRE D'ACCÈS
  (
    'THE-2024-012',
    'L''architecture des médinas marocaines : Patrimoine et modernité',
    'عمارة المدن المغربية العتيقة: التراث والحداثة',
    'Samira Bennani',
    NULL,
    '2024',
    'Université Mohammed V',
    'Rabat',
    512,
    '978-9954-567-890-1',
    '720.964.BEN',
    'THE-2024-012',
    'Thèse',
    'libre_acces',
    true,
    true,
    'Thèse de doctorat en architecture analysant l''évolution urbaine des médinas marocaines et les enjeux de préservation du patrimoine architectural face à la modernisation.',
    'Thèse de doctorat sur l''architecture des médinas marocaines entre tradition et modernité.',
    ARRAY['Méthodologie de recherche', 'Analyse historique des médinas', 'Typologie architecturale', 'Enjeux de conservation', 'Propositions d''aménagement', 'Conclusion et perspectives'],
    ARRAY['Architecture', 'Médina', 'Patrimoine', 'Urbanisme', 'Conservation', 'Modernisation'],
    'Thèses et Mémoires',
    'Français',
    '512 p. : ill., plans ; 30 cm',
    'Bibliothèque Nationale du Royaume du Maroc',
    'https://bibliotheque-numerique-bnrm.ma/theses/THE-2024-012'
  ),
  -- 8. Carte ancienne
  (
    'CAR-1750-008',
    'Carte du Royaume de Fez et du Maroc',
    NULL,
    'Jacques-Nicolas Bellin',
    NULL,
    '1750',
    'Dépôt des cartes et plans de la Marine',
    'Paris',
    NULL,
    NULL,
    '912.64.BEL',
    'CAR-1750-008',
    'Carte ancienne',
    'non_numerise',
    false,
    false,
    'Carte géographique gravée du XVIIIe siècle représentant le Royaume de Fès et le Maroc. Document cartographique d''une grande valeur historique nécessitant des précautions particulières de manipulation.',
    'Carte géographique historique du Maroc datant du XVIIIe siècle.',
    NULL,
    ARRAY['Cartographie ancienne', 'Géographie historique', 'XVIIIe siècle', 'Royaume de Fès'],
    'Cartes et Plans Anciens',
    'Français / Latin',
    '1 carte : grav. col. ; 48 x 62 cm',
    'Bibliothèque Nationale du Royaume du Maroc',
    NULL
  ),
  -- 9. MICROFILM - Ibn Khaldoun
  (
    'MIC-1320-001',
    'Al-Muqaddima - Ibn Khaldoun (Manuscrit original)',
    'المقدمة - ابن خلدون (مخطوط أصلي)',
    'Ibn Khaldoun',
    NULL,
    '1320',
    'Manuscrit médiéval',
    'Fès',
    378,
    NULL,
    '091.MAR.IBN.M',
    'MIC-1320-001',
    'Microfilm',
    'numerise',
    false,
    false,
    'Manuscrit original d''Al-Muqaddima conservé sur microfilm 35mm. Ce document exceptionnel du XIVe siècle est l''un des plus importants textes de philosophie de l''histoire et de sociologie du monde arabe. Le manuscrit original étant très fragile, seul le microfilm est disponible pour consultation.',
    'Manuscrit médiéval d''Ibn Khaldoun conservé sur microfilm - Document patrimonial exceptionnel.',
    ARRAY['Introduction à la science de la civilisation', 'Les dynasties et les royaumes', 'L''organisation sociale et politique', 'Les sciences et les arts', 'La méthodologie historique'],
    ARRAY['Manuscrit', 'Microfilm', 'Ibn Khaldoun', 'Philosophie', 'Histoire', 'Sociologie', 'Patrimoine islamique'],
    'Fonds Manuscrits sur Microfilms',
    'Arabe classique',
    'Microfilm 35mm, 4 bobines - Manuscrit original : 378 folios, calligraphie maghribine',
    'Bibliothèque Nationale du Royaume du Maroc',
    'https://bibliotheque-numerique-bnrm.ma/microfilms/MIC-1320-001'
  ),
  -- 10. MICROFILM - Hadiths Qarawiyine
  (
    'MIC-1450-002',
    'Recueil de Hadiths - Manuscrit de la Qarawiyine',
    'مجموع الأحاديث - مخطوط القرويين',
    'Al-Qadi Iyad',
    NULL,
    '1450',
    'Manuscrit de la Mosquée Qarawiyine',
    'Fès',
    524,
    NULL,
    '091.QAR.HAD.M',
    'MIC-1450-002',
    'Microfilm',
    'numerise',
    false,
    false,
    'Recueil exceptionnel de Hadiths du XVe siècle provenant de la bibliothèque de la mosquée Qarawiyine. Conservé sur microfilm pour préserver l''original. Ce manuscrit contient des annotations rares de plusieurs savants marocains de l''époque. La qualité de la calligraphie et des enluminures en fait un document d''une valeur patrimoniale inestimable.',
    'Manuscrit religieux du XVe siècle de la Qarawiyine - Conservation sur microfilm.',
    ARRAY['Hadiths sur la foi et les croyances', 'Hadiths sur les pratiques religieuses', 'Hadiths sur l''éthique et la morale', 'Commentaires des savants', 'Index thématique'],
    ARRAY['Manuscrit', 'Microfilm', 'Hadiths', 'Islam', 'Qarawiyine', 'Patrimoine religieux', 'Calligraphie'],
    'Fonds Manuscrits Religieux sur Microfilms',
    'Arabe classique',
    'Microfilm 35mm, 6 bobines - Manuscrit original : 524 folios, calligraphie andalouse avec enluminures',
    'Bibliothèque Nationale du Royaume du Maroc - Fonds Qarawiyine',
    'https://bibliotheque-numerique-bnrm.ma/microfilms/MIC-1450-002'
  )
ON CONFLICT (id) DO NOTHING;