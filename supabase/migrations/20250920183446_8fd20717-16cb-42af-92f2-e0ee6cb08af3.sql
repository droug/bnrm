-- Ajouter quelques manuscrits fictifs pour la démonstration
INSERT INTO manuscripts (title, author, description, language, period, material, access_level, status, inventory_number) VALUES
('Kitab al-Hikmah', 'Al-Kindi', 'Traité de philosophie du IXe siècle', 'Arabe', 'IXe siècle', 'Parchemin', 'public', 'available', 'MS-001'),
('Chronique de la conquête', 'Ibn al-Qutiyya', 'Histoire de la conquête de l''Andalousie', 'Arabe', 'Xe siècle', 'Papier', 'restricted', 'available', 'MS-002'),
('Recueil de poésie', 'Auteur inconnu', 'Collection de poèmes andalous', 'Arabe', 'XIe siècle', 'Parchemin', 'public', 'available', 'MS-003'),
('Traité de médecine', 'Ibn Sina', 'Manuel médical complet', 'Arabe', 'XIe siècle', 'Papier', 'restricted', 'unavailable', 'MS-004'),
('Livre des Étoiles', 'Al-Battani', 'Traité d''astronomie avec cartes célestes', 'Arabe', 'Xe siècle', 'Vélin', 'public', 'available', 'MS-005');

-- Ajouter quelques collections
INSERT INTO collections (name, description) VALUES
('Collection andalouse', 'Manuscrits de l''Espagne musulmane'),
('Fonds scientifique', 'Traités de sciences exactes et naturelles'),
('Patrimoine littéraire', 'Œuvres poétiques et littéraires classiques');

-- Ajouter des catégories
INSERT INTO categories (name, description) VALUES
('Histoire', 'Manuscrits historiques et chroniques'),
('Philosophie', 'Traités philosophiques et théologiques'),
('Sciences', 'Mathématiques, astronomie, médecine'),
('Littérature', 'Poésie et prose littéraire'),
('Religion', 'Textes religieux et commentaires');