-- Ajouter les colonnes manquantes pour le diagnostic et la restauration
ALTER TABLE restoration_requests 
  ADD COLUMN IF NOT EXISTS conservation_state TEXT,
  ADD COLUMN IF NOT EXISTS identified_damages TEXT,
  ADD COLUMN IF NOT EXISTS recommended_works TEXT,
  ADD COLUMN IF NOT EXISTS required_materials TEXT,
  ADD COLUMN IF NOT EXISTS initial_condition TEXT,
  ADD COLUMN IF NOT EXISTS works_performed TEXT,
  ADD COLUMN IF NOT EXISTS materials_used TEXT,
  ADD COLUMN IF NOT EXISTS techniques_applied TEXT,
  ADD COLUMN IF NOT EXISTS final_condition TEXT,
  ADD COLUMN IF NOT EXISTS recommendations TEXT,
  ADD COLUMN IF NOT EXISTS actual_duration INTEGER,
  ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN restoration_requests.conservation_state IS 'État de conservation évalué lors du diagnostic';
COMMENT ON COLUMN restoration_requests.identified_damages IS 'Dommages identifiés lors du diagnostic';
COMMENT ON COLUMN restoration_requests.recommended_works IS 'Travaux recommandés suite au diagnostic';
COMMENT ON COLUMN restoration_requests.required_materials IS 'Matériaux nécessaires pour la restauration';
COMMENT ON COLUMN restoration_requests.initial_condition IS 'État initial du manuscrit avant restauration';
COMMENT ON COLUMN restoration_requests.works_performed IS 'Travaux effectués pendant la restauration';
COMMENT ON COLUMN restoration_requests.materials_used IS 'Matériaux utilisés pendant la restauration';
COMMENT ON COLUMN restoration_requests.techniques_applied IS 'Techniques de restauration appliquées';
COMMENT ON COLUMN restoration_requests.final_condition IS 'État final du manuscrit après restauration';
COMMENT ON COLUMN restoration_requests.recommendations IS 'Recommandations pour la conservation future';
COMMENT ON COLUMN restoration_requests.actual_duration IS 'Durée réelle de la restauration en jours';
COMMENT ON COLUMN restoration_requests.actual_cost IS 'Coût réel de la restauration en DH';