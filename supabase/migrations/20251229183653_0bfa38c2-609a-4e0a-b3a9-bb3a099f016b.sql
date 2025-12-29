-- Créer une table pour les restrictions d'accès des documents de la bibliothèque numérique
CREATE TABLE IF NOT EXISTS public.digital_library_access_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  document_source TEXT NOT NULL DEFAULT 'cbn_documents', -- 'cbn_documents', 'manuscripts', 'content'
  
  -- Niveau d'accès global
  access_level TEXT NOT NULL DEFAULT 'public', -- 'public', 'restricted', 'internal', 'copyrighted'
  
  -- Consultation
  allow_full_consultation BOOLEAN DEFAULT true,
  consultation_percentage INTEGER DEFAULT 100, -- Pourcentage de pages consultables (ex: 10% pour aperçu)
  allowed_pages INTEGER[] DEFAULT NULL, -- Pages spécifiques autorisées (NULL = toutes selon pourcentage)
  
  -- Téléchargement
  allow_download BOOLEAN DEFAULT true,
  download_format TEXT[] DEFAULT ARRAY['pdf'], -- Formats autorisés: 'pdf', 'epub', 'jpg'
  download_watermark BOOLEAN DEFAULT false,
  
  -- Partage
  allow_sharing BOOLEAN DEFAULT true,
  allow_embed BOOLEAN DEFAULT true,
  
  -- Sécurité
  block_right_click BOOLEAN DEFAULT false,
  block_screenshot BOOLEAN DEFAULT false,
  block_print BOOLEAN DEFAULT false,
  
  -- Droits d'auteur
  copyright_status TEXT DEFAULT 'unknown', -- 'public_domain', 'copyrighted', 'creative_commons', 'unknown'
  copyright_holder TEXT,
  copyright_expires_at DATE,
  license_type TEXT, -- 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'All rights reserved', etc.
  license_url TEXT,
  
  -- Messages personnalisés
  restriction_message_fr TEXT,
  restriction_message_ar TEXT,
  
  -- Métadonnées
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(document_id, document_source)
);

-- Index pour les recherches
CREATE INDEX idx_dlar_document_id ON digital_library_access_restrictions(document_id);
CREATE INDEX idx_dlar_access_level ON digital_library_access_restrictions(access_level);
CREATE INDEX idx_dlar_copyright_status ON digital_library_access_restrictions(copyright_status);

-- Enable RLS
ALTER TABLE digital_library_access_restrictions ENABLE ROW LEVEL SECURITY;

-- Politique: tout le monde peut voir les restrictions
CREATE POLICY "Tout le monde peut voir les restrictions" 
ON digital_library_access_restrictions 
FOR SELECT 
USING (true);

-- Politique: admins peuvent gérer les restrictions
CREATE POLICY "Admins peuvent gérer les restrictions" 
ON digital_library_access_restrictions 
FOR ALL 
USING (is_admin_or_librarian(auth.uid()));

-- Insérer quelques exemples de restrictions variées
INSERT INTO digital_library_access_restrictions 
(document_id, document_source, access_level, allow_full_consultation, consultation_percentage, allow_download, allow_sharing, block_right_click, block_screenshot, copyright_status, copyright_holder, license_type, restriction_message_fr, restriction_message_ar)
VALUES
-- Document libre accès complet
('0c7e19ea-b8c0-41a2-987f-e3b042744130', 'cbn_documents', 'public', true, 100, true, true, false, false, 'public_domain', NULL, 'Domaine public', 
 'Ce document est en libre accès. Vous pouvez le consulter, télécharger et partager librement.', 
 'هذه الوثيقة متاحة للجميع. يمكنك الاطلاع عليها وتحميلها ومشاركتها بحرية.'),

-- Document sous droits d'auteur (consultation partielle uniquement)
('d9438de4-d465-470a-af9d-0638b01fd3cc', 'cbn_documents', 'copyrighted', false, 10, false, false, true, true, 'copyrighted', 'Mohammed Bennis', 'All rights reserved',
 'Ce document est protégé par le droit d''auteur. Seul un aperçu de 10% est disponible. Le téléchargement et le partage sont interdits.',
 'هذه الوثيقة محمية بحقوق النشر. يتوفر فقط عرض 10%. التحميل والمشاركة ممنوعان.'),

-- Document à accès restreint (chercheurs uniquement)
('882e74d0-c1a1-43f6-a269-eb749e6ee61b', 'cbn_documents', 'restricted', true, 100, false, true, false, false, 'copyrighted', 'Fondation du Roi Abdul-Aziz', 'CC-BY-NC',
 'Ce document est accessible en consultation complète mais le téléchargement est réservé aux chercheurs accrédités.',
 'هذه الوثيقة متاحة للاطلاع الكامل لكن التحميل مخصص للباحثين المعتمدين.'),

-- Document Creative Commons
('1a81aa7e-a329-44c8-bb42-89a7dc837ac5', 'cbn_documents', 'public', true, 100, true, true, false, false, 'creative_commons', 'Driss Zejli', 'CC-BY-SA',
 'Ce document est sous licence Creative Commons CC-BY-SA. Vous pouvez le partager et l''adapter à condition de créditer l''auteur.',
 'هذه الوثيقة تحت ترخيص Creative Commons CC-BY-SA. يمكنك مشاركتها وتعديلها بشرط ذكر المؤلف.'),

-- Document interne (accès limité)
('73705717-c9bb-46d6-b7b4-2ab2d7f799b6', 'cbn_documents', 'internal', false, 25, false, false, true, true, 'copyrighted', 'Ministère de l''Enseignement Supérieur', 'All rights reserved',
 'Ce document est à usage interne uniquement. Un aperçu de 25% est disponible. Contactez la bibliothèque pour un accès complet.',
 'هذه الوثيقة للاستخدام الداخلي فقط. عرض 25% متاح. اتصل بالمكتبة للحصول على وصول كامل.')
ON CONFLICT (document_id, document_source) DO NOTHING;