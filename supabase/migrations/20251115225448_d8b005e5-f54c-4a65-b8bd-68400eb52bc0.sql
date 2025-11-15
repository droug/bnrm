-- Modifier la contrainte pour autoriser les types d'authentification
ALTER TABLE public.external_system_configs DROP CONSTRAINT IF EXISTS external_system_configs_system_type_check;

ALTER TABLE public.external_system_configs ADD CONSTRAINT external_system_configs_system_type_check 
CHECK (system_type IN ('catalog', 'sigb', 'z3950', 'oai-pmh', 'auth', 'ldap', 'active_directory'));

-- Ajout du système Active Directory
INSERT INTO public.external_system_configs (
  system_name,
  system_type,
  display_name,
  description,
  base_url,
  api_key_encrypted,
  username,
  password_encrypted,
  is_active,
  is_configured,
  sync_frequency_minutes,
  additional_params
) VALUES (
  'active_directory',
  'active_directory',
  'Active Directory',
  'Système d''authentification Active Directory / LDAP',
  '',
  '',
  '',
  '',
  false,
  false,
  60,
  '{"port": 389, "use_ssl": false, "base_dn": ""}'::jsonb
) ON CONFLICT (system_name) DO NOTHING;