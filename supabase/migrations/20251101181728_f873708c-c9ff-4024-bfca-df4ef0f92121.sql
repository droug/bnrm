-- Peupler le CBM avec tous les documents du CBN
INSERT INTO cbm_catalog (
  cbm_record_id,
  cbn_document_id,
  library_code,
  library_name,
  source_library,
  title,
  title_ar,
  author,
  author_ar,
  publisher,
  publication_year,
  document_type,
  isbn,
  dewey_classification,
  subject_headings,
  availability_status,
  shelf_location,
  metadata_source
)
SELECT 
  'CBN-' || id as cbm_record_id,
  id as cbn_document_id,
  'BNRM' as library_code,
  'Bibliothèque Nationale du Royaume du Maroc' as library_name,
  'BNRM' as source_library,
  title,
  title_ar,
  author,
  author_ar,
  publisher,
  publication_year,
  document_type,
  isbn,
  dewey_classification,
  keywords as subject_headings,
  CASE 
    WHEN physical_status = 'bon' THEN 'Disponible'
    WHEN physical_status = 'restauration' THEN 'En restauration'
    ELSE 'Consultation sur demande'
  END as availability_status,
  cote as shelf_location,
  'Z39.50' as metadata_source
FROM cbn_documents
WHERE deleted_at IS NULL
ON CONFLICT (cbm_record_id) DO NOTHING;

-- Ajouter des documents d'autres bibliothèques marocaines

-- BU Hassan II Casablanca
INSERT INTO cbm_catalog (
  cbm_record_id, library_code, library_name, source_library,
  title, author, publisher, publication_year, document_type,
  isbn, availability_status, metadata_source
) VALUES
('BUH2C-001', 'BUH2C', 'BU Hassan II Casablanca', 'BU Hassan II Casablanca',
 'Histoire économique du Maroc contemporain', 'Mohammed Kenbib', 'Publications de la Faculté des Lettres', 2015,
 'Livre', '978-9954-0-1234-5', 'Disponible', 'Z39.50'),
 
('BUH2C-002', 'BUH2C', 'BU Hassan II Casablanca', 'BU Hassan II Casablanca',
 'Le Maroc et l''Afrique : Histoire et perspectives', 'Abdellatif Laâbi', 'Toubkal', 2018,
 'Livre', '978-9954-1-2345-6', 'Disponible', 'Z39.50'),
 
('BUH2C-003', 'BUH2C', 'BU Hassan II Casablanca', 'BU Hassan II Casablanca',
 'Revue Marocaine de Droit et d''Économie du Développement', NULL, 'Université Hassan II', 2023,
 'Périodique', NULL, 'Disponible', 'Z39.50'),
 
('BUH2C-004', 'BUH2C', 'BU Hassan II Casablanca', 'BU Hassan II Casablanca',
 'L''urbanisation au Maroc : Défis et opportunités', 'Samira Kassimi', 'L''Harmattan', 2020,
 'Livre', '978-2-343-12345-7', 'Emprunté', 'Z39.50'),
 
('BUH2C-005', 'BUH2C', 'BU Hassan II Casablanca', 'BU Hassan II Casablanca',
 'Études sur le développement durable au Maghreb', 'Collectif', 'Presses Universitaires', 2021,
 'Livre', '978-9954-2-3456-7', 'Disponible', 'SRU');

-- BU Mohammed V Rabat
INSERT INTO cbm_catalog (
  cbm_record_id, library_code, library_name, source_library,
  title, author, publisher, publication_year, document_type,
  isbn, availability_status, metadata_source
) VALUES
('BUMVR-001', 'BUMVR', 'BU Mohammed V Rabat', 'BU Mohammed V Rabat',
 'La littérature marocaine contemporaine', 'Ahmed Bouanani', 'Le Fennec', 2012,
 'Livre', '978-9981-0-1234-1', 'Disponible', 'Z39.50'),
 
('BUMVR-002', 'BUMVR', 'BU Mohammed V Rabat', 'BU Mohammed V Rabat',
 'Sciences politiques et gouvernance au Maghreb', 'Fatima Harrak', 'Rabat Net', 2019,
 'Livre', '978-9954-3-4567-8', 'Disponible', 'Z39.50'),
 
('BUMVR-003', 'BUMVR', 'BU Mohammed V Rabat', 'BU Mohammed V Rabat',
 'Architecture traditionnelle marocaine', 'Hassan Radoine', 'Centre Jacques-Berque', 2017,
 'Livre', '978-9954-4-5678-9', 'En restauration', 'Z39.50'),
 
('BUMVR-004', 'BUMVR', 'BU Mohammed V Rabat', 'BU Mohammed V Rabat',
 'Revue Marocaine des Sciences Juridiques', NULL, 'Faculté de Droit', 2024,
 'Périodique', NULL, 'Disponible', 'Z39.50'),
 
('BUMVR-005', 'BUMVR', 'BU Mohammed V Rabat', 'BU Mohammed V Rabat',
 'Migration et développement au Maroc', 'Mohamed Khachani', 'Publications AMERM', 2016,
 'Thèse', NULL, 'Disponible', 'SRU');

-- Médiathèque de Marrakech
INSERT INTO cbm_catalog (
  cbm_record_id, library_code, library_name, source_library,
  title, author, publisher, publication_year, document_type,
  isbn, availability_status, metadata_source
) VALUES
('MEDMRK-001', 'MEDMRK', 'Médiathèque de Marrakech', 'Médiathèque de Marrakech',
 'L''art de la calligraphie arabe', 'Hassan Massoudy', 'Flammarion', 2013,
 'Livre', '978-2-08-130123-4', 'Disponible', 'OAI-PMH'),
 
('MEDMRK-002', 'MEDMRK', 'Médiathèque de Marrakech', 'Médiathèque de Marrakech',
 'Contes et légendes du Maroc', 'Fatema Mernissi', 'Le Fennec', 2010,
 'Livre', '978-9981-0-2345-2', 'Disponible', 'OAI-PMH'),
 
('MEDMRK-003', 'MEDMRK', 'Médiathèque de Marrakech', 'Médiathèque de Marrakech',
 'Patrimoine architectural de Marrakech', 'Mohamed Mezzine', 'Éditions La Croisée', 2014,
 'Livre', '978-9954-5-6789-0', 'Emprunté', 'OAI-PMH'),
 
('MEDMRK-004', 'MEDMRK', 'Médiathèque de Marrakech', 'Médiathèque de Marrakech',
 'Guide du jardinage en climat méditerranéen', 'Aicha Belarbi', 'Tarik Éditions', 2019,
 'Livre', '978-9920-0-1234-5', 'Disponible', 'OAI-PMH');

-- Bibliothèque Municipale de Fès
INSERT INTO cbm_catalog (
  cbm_record_id, library_code, library_name, source_library,
  title, author, publisher, publication_year, document_type,
  isbn, availability_status, metadata_source
) VALUES
('BMFES-001', 'BMFES', 'Bibliothèque Municipale de Fès', 'Bibliothèque Municipale de Fès',
 'Histoire de la ville de Fès', 'Roger Le Tourneau', 'Casablanca', 1949,
 'Livre', NULL, 'Disponible', 'Z39.50'),
 
('BMFES-002', 'BMFES', 'Bibliothèque Municipale de Fès', 'Bibliothèque Municipale de Fès',
 'L''artisanat fassi : Tradition et modernité', 'Abderrahmane Tenkoul', 'Éditions El Maarif Al Jadida', 2011,
 'Livre', '978-9954-6-7890-1', 'Disponible', 'Z39.50'),
 
('BMFES-003', 'BMFES', 'Bibliothèque Municipale de Fès', 'Bibliothèque Municipale de Fès',
 'La Qarawiyine : Histoire de la plus ancienne université au monde', 'Mohammed El Fasi', 'Publications de l''Université Quaraouiyine', 2008,
 'Livre', '978-9981-1-3456-3', 'Disponible', 'Z39.50'),
 
('BMFES-004', 'BMFES', 'Bibliothèque Municipale de Fès', 'Bibliothèque Municipale de Fès',
 'Musique andalouse et patrimoine marocain', 'Ahmed Aydoun', 'Marsam', 2015,
 'Livre', '978-9954-7-8901-2', 'Disponible', 'OAI-PMH');

-- Bibliothèque Nationale de Tanger
INSERT INTO cbm_catalog (
  cbm_record_id, library_code, library_name, source_library,
  title, author, publisher, publication_year, document_type,
  isbn, availability_status, metadata_source
) VALUES
('BNTNG-001', 'BNTNG', 'Bibliothèque Nationale de Tanger', 'Bibliothèque Nationale de Tanger',
 'Tanger : Ville cosmopolite', 'Mohamed Choukri', 'Tarik Éditions', 2005,
 'Livre', '978-9981-2-4567-4', 'Disponible', 'Z39.50'),
 
('BNTNG-002', 'BNTNG', 'Bibliothèque Nationale de Tanger', 'Bibliothèque Nationale de Tanger',
 'Le détroit de Gibraltar : Histoire et enjeux', 'Abdelmajid Benjelloun', 'L''Harmattan', 2013,
 'Livre', '978-2-343-23456-8', 'Disponible', 'Z39.50'),
 
('BNTNG-003', 'BNTNG', 'Bibliothèque Nationale de Tanger', 'Bibliothèque Nationale de Tanger',
 'Patrimoine andalou au Nord du Maroc', 'Nadia Lamlili', 'Centre Nord-Sud', 2018,
 'Livre', '978-9954-8-9012-3', 'Emprunté', 'SRU');