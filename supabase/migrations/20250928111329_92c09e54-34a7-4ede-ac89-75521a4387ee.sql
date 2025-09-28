-- Créer des données d'exemple simplifiées pour BNRM

-- 1. Créer du contenu d'exemple
INSERT INTO public.content (id, title, content_body, content_type, author_id, status, created_at, published_at, slug) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Histoire du Maroc Moderne', 'Publication sur l''histoire contemporaine du Maroc...', 'news', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'published', '2024-01-15 10:30:00', '2024-01-15 10:30:00', 'histoire-maroc-moderne'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Revue Scientifique N°45', 'Nouvelle édition de la revue scientifique...', 'news', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'published', '2024-02-01 10:00:00', '2024-02-01 10:00:00', 'revue-45'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Logiciel Patrimoine', 'Nouveau système numérique...', 'news', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'published', '2024-02-15 11:15:00', '2024-02-15 11:15:00', 'logiciel'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Manuscrits Andalous', 'Exposition de manuscrits...', 'exhibition', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'published', '2024-02-20 09:45:00', '2024-02-20 09:45:00', 'manuscrits'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Manuel Scolaire', 'Manuel en préparation...', 'news', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'draft', '2024-03-01 08:20:00', NULL, 'manuel')
ON CONFLICT (id) DO NOTHING;

-- 2. Créer les demandes de dépôt légal
INSERT INTO public.legal_deposits (id, submitter_id, content_id, deposit_type, status, submission_date, deposit_number, metadata) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'mandatory', 'processed', '2024-01-15 10:30:00', 'DL-2024-000001', '{"type": "livre", "isbn": "978-9954-123-45-6", "title": "Histoire du Maroc Moderne", "pages": 350}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'voluntary', 'acknowledged', '2024-02-01 10:00:00', 'DL-2024-000002', '{"type": "revue", "issn": "1234-5678", "title": "Revue Scientifique", "issue": 45}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'special', 'submitted', '2024-02-15 11:15:00', 'DL-2024-000003', '{"type": "logiciel", "version": "1.2.0", "title": "Patrimoine BD"}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'mandatory', 'processed', '2024-02-20 09:45:00', 'DL-2024-000004', '{"type": "collection", "title": "Manuscrits", "size": 150}'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'mandatory', 'submitted', '2024-03-01 08:20:00', 'DL-2024-000005', '{"type": "manuel", "isbn": "978-9954-123-45-7", "pages": 180}')
ON CONFLICT (id) DO NOTHING;

-- 3. Workflow simple
INSERT INTO public.workflows (id, name, description, workflow_type, steps, is_active) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Validation Standard', 'Processus de validation', 'legal_deposit', '[
  {"step": 1, "name": "Réception", "description": "Vérification du dossier", "role": "agent"},
  {"step": 2, "name": "Contrôle", "description": "Vérification technique", "role": "validator"},
  {"step": 3, "name": "Validation", "description": "Approbation finale", "role": "supervisor"}
]', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Instances de workflow
INSERT INTO public.workflow_instances (id, workflow_id, content_id, started_by, status, current_step, started_at, metadata) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'completed', 3, '2024-01-15 10:30:00', '{"type": "livre"}'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'in_progress', 2, '2024-02-01 10:00:00', '{"type": "revue"}'),
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'in_progress', 1, '2024-02-15 11:15:00', '{"type": "logiciel"}')
ON CONFLICT (id) DO NOTHING;

-- 5. Paramètres BNRM
INSERT INTO public.bnrm_parametres (parametre, valeur, commentaire) VALUES
('delai_standard', '5', 'Délai standard en jours'),
('delai_urgent', '1', 'Délai urgent'),
('exemplaires_min', '2', 'Exemplaires minimum'),
('formats_acceptes', 'PDF,DOC,EPUB', 'Formats numériques'),
('notifications_email', 'true', 'Notifications actives'),
('isbn_auto', 'true', 'Attribution automatique ISBN')
ON CONFLICT (parametre) DO NOTHING;