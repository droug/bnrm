-- Ajout du système DBM-600 dans les configurations externes
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
  'dbm-600',
  'sigb',
  'DBM-600',
  'Système de gestion bibliothécaire DBM-600',
  '',
  '',
  '',
  '',
  false,
  false,
  60,
  '{}'::jsonb
) ON CONFLICT (system_name) DO NOTHING;