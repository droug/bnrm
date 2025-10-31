-- Ajouter les colonnes de hiérarchie et de synchronisation aux listes auto-complètes
-- Pour avoir la même structure que les system_lists

-- Ajouter les champs de hiérarchie
ALTER TABLE autocomplete_lists
ADD COLUMN IF NOT EXISTS portal TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT,
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS sub_service TEXT,
ADD COLUMN IF NOT EXISTS sync_hash TEXT;

-- Ajouter un champ metadata aux valeurs pour stocker des infos supplémentaires (dialCode, flag, etc.)
ALTER TABLE autocomplete_list_values
ADD COLUMN IF NOT EXISTS value_label_ar TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Créer un index sur sync_hash pour accélérer les vérifications
CREATE INDEX IF NOT EXISTS idx_autocomplete_lists_sync_hash ON autocomplete_lists(sync_hash);

-- Créer des index pour la hiérarchie
CREATE INDEX IF NOT EXISTS idx_autocomplete_lists_hierarchy ON autocomplete_lists(portal, platform, service, sub_service);

-- Créer un index sur les métadonnées
CREATE INDEX IF NOT EXISTS idx_autocomplete_values_metadata ON autocomplete_list_values USING GIN(metadata);