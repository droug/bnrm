-- Créer le bucket pour les fichiers de participants de formation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'formations',
  'formations',
  false,
  10485760, -- 10MB
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;