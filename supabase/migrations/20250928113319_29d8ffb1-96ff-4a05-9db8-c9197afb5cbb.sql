-- Ajouter seulement les nouvelles step executions pour les instances existantes
INSERT INTO workflow_step_executions (id, workflow_instance_id, step_number, step_name, status, assigned_to, started_at, completed_at, comments, metadata) VALUES
-- Pour l'instance completée d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Validation technique', 'completed', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-01-15 10:30:00', '2024-01-16 14:00:00', 'Validation réussie après vérification complète', '{"validation_score": 95}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 'Validation éditoriale', 'completed', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-01-16 14:30:00', '2024-01-17 16:45:00', 'Contenu conforme aux standards éditoriaux', '{"editorial_score": 88}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, 'Approbation finale', 'completed', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-01-17 17:00:00', '2024-01-18 09:30:00', 'Publication approuvée', '{"final_approval": true}'),

-- Pour l'instance en cours d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12  
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, 'Validation technique', 'completed', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-02-01 10:00:00', '2024-02-02 15:30:00', 'Validation technique terminée avec succès', '{"validation_score": 92}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2, 'Validation éditoriale', 'in_progress', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-02-02 16:00:00', NULL, 'En cours de révision éditoriale', '{"current_reviewer": "expert_1"}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 3, 'Approbation finale', 'pending', NULL, NULL, NULL, NULL, '{}'),

-- Pour l'instance en cours d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, 'Validation technique', 'in_progress', '5631cc25-129d-4635-bbf3-a9eb8443f6a4', '2024-02-15 11:15:00', NULL, 'Vérification des spécifications techniques en cours', '{"progress": 60}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 2, 'Validation éditoriale', 'pending', NULL, NULL, NULL, NULL, '{}'),
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 3, 'Approbation finale', 'pending', NULL, NULL, NULL, NULL, '{}');