-- Ajouter des utilisateurs fictifs dans auth.users et leurs profils
-- Note: En production, ces utilisateurs seraient créés via l'inscription normale

-- Insérer des profils fictifs (simulant des utilisateurs déjà inscrits)
INSERT INTO profiles (user_id, first_name, last_name, institution, research_field, phone, role, is_approved) VALUES
('11111111-1111-1111-1111-111111111111', 'Marie', 'Dupont', 'Université de Paris', 'Histoire médiévale', '+33123456789', 'researcher', true),
('22222222-2222-2222-2222-222222222222', 'Jean', 'Martin', 'CNRS', 'Manuscrits arabes', '+33234567890', 'researcher', false),
('33333333-3333-3333-3333-333333333333', 'Sophie', 'Bernard', 'BNF', 'Conservation', '+33345678901', 'librarian', true),
('44444444-4444-4444-4444-444444444444', 'Ahmed', 'Benali', 'Institut du Maroc', 'Paléographie', '+212123456789', 'visitor', false),
('55555555-5555-5555-5555-555555555555', 'Emma', 'Johnson', 'Oxford University', 'Codicologie', '+441234567890', 'researcher', true);

-- Ajouter quelques manuscrits fictifs
INSERT INTO manuscripts (title, author, description, language, period, material, access_level, status, inventory_number) VALUES
('Kitab al-Hikmah', 'Al-Kindi', 'Traité de philosophie du IXe siècle', 'Arabe', 'IXe siècle', 'Parchemin', 'public', 'available', 'MS-001'),
('Chronique de la conquête', 'Ibn al-Qutiyya', 'Histoire de la conquête de l''Andalousie', 'Arabe', 'Xe siècle', 'Papier', 'restricted', 'available', 'MS-002'),
('Recueil de poésie', 'Auteur inconnu', 'Collection de poèmes andalous', 'Arabe', 'XIe siècle', 'Parchemin', 'public', 'available', 'MS-003'),
('Traité de médecine', 'Ibn Sina', 'Manuel médical complet', 'Arabe', 'XIe siècle', 'Papier', 'restricted', 'under_restoration', 'MS-004');

-- Ajouter des demandes d'accès fictives
INSERT INTO access_requests (user_id, manuscript_id, request_type, purpose, requested_date, status, notes) VALUES
('22222222-2222-2222-2222-222222222222', (SELECT id FROM manuscripts WHERE inventory_number = 'MS-002'), 'consultation', 'Recherche pour thèse de doctorat sur l''historiographie andalouse', '2024-01-15', 'pending', 'Première demande du chercheur'),
('44444444-4444-4444-4444-444444444444', (SELECT id FROM manuscripts WHERE inventory_number = 'MS-004'), 'digitization', 'Projet de numérisation collaborative avec l''Institut du Maroc', '2024-01-10', 'pending', 'Demande d''accès pour équipe de digitalisation'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM manuscripts WHERE inventory_number = 'MS-002'), 'consultation', 'Analyse paléographique comparative', '2024-01-12', 'approved', 'Demande approuvée - chercheur expérimenté'),
('55555555-5555-5555-5555-555555555555', (SELECT id FROM manuscripts WHERE inventory_number = 'MS-004'), 'consultation', 'Étude codicologique pour publication académique', '2024-01-08', 'rejected', 'Manuscrit en cours de restauration');

-- Ajouter quelques collections et catégories
INSERT INTO collections (name, description, curator_id) VALUES
('Collection andalouse', 'Manuscrits de l''Espagne musulmane', '33333333-3333-3333-3333-333333333333'),
('Fonds scientifique', 'Traités de sciences exactes et naturelles', '33333333-3333-3333-3333-333333333333');

INSERT INTO categories (name, description) VALUES
('Histoire', 'Manuscrits historiques et chroniques'),
('Philosophie', 'Traités philosophiques et théologiques'),
('Sciences', 'Mathématiques, astronomie, médecine'),
('Littérature', 'Poésie et prose littéraire');