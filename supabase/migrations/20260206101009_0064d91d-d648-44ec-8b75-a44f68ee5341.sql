-- Ajouter les rôles manquants dans system_roles (admin et validateur)
INSERT INTO public.system_roles (role_code, role_name, role_category, description, is_active, permissions, limits)
VALUES 
  ('admin', 'Administrateur', 'administration', 'Accès complet au système', true, 
   '["system.manage", "users.manage", "roles.manage", "all.access"]'::jsonb, 
   '{"maxDownloadsPerDay": 999, "maxRequests": 999, "canDownload": true}'::jsonb),
  ('validateur', 'Validateur DL', 'administration', 'Validation des demandes de dépôt légal en arbitrage', true,
   '["legal_deposit.validate", "legal_deposit.arbitrate"]'::jsonb,
   '{"maxDownloadsPerDay": 999, "maxRequests": 999}'::jsonb)
ON CONFLICT (role_code) DO NOTHING;