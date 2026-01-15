-- Ajouter les colonnes de configuration API à la table sigb_sync_config
ALTER TABLE public.sigb_sync_config
ADD COLUMN IF NOT EXISTS auth_type TEXT DEFAULT 'none', -- 'none', 'api_key', 'basic_auth', 'bearer_token'
ADD COLUMN IF NOT EXISTS api_key_header TEXT DEFAULT 'X-API-Key', -- Nom du header pour la clé API
ADD COLUMN IF NOT EXISTS api_key_value TEXT, -- Valeur de la clé API (stockée chiffrée)
ADD COLUMN IF NOT EXISTS basic_auth_username TEXT,
ADD COLUMN IF NOT EXISTS basic_auth_password TEXT,
ADD COLUMN IF NOT EXISTS bearer_token TEXT,
ADD COLUMN IF NOT EXISTS custom_headers JSONB DEFAULT '{}', -- Headers personnalisés additionnels
ADD COLUMN IF NOT EXISTS request_timeout_seconds INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS api_endpoint_path TEXT DEFAULT '/api/export', -- Chemin de l'API
ADD COLUMN IF NOT EXISTS response_format TEXT DEFAULT 'json'; -- 'json', 'xml', 'marc'