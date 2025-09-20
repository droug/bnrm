-- Programmer le nettoyage automatique des logs d'activité
-- Exécution quotidienne à 2h00 du matin

-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Programmer la tâche de nettoyage quotidien
SELECT cron.schedule(
  'cleanup-activity-logs-daily',
  '0 2 * * *', -- Tous les jours à 2h00 du matin
  $$
  SELECT net.http_post(
    url := 'https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/cleanup-activity-logs',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZmVwcG16bnVwenFrcW16anp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzMxNDYsImV4cCI6MjA3Mzk0OTE0Nn0._lNseTnhm88eUPMAMxeTZ-qn2vWGPm73M66lppaoSWE"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Vérifier les tâches programmées
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'cleanup-activity-logs-daily';

COMMENT ON EXTENSION pg_cron IS 'Extension pour programmer des tâches automatiques';
COMMENT ON EXTENSION pg_net IS 'Extension pour faire des requêtes HTTP depuis PostgreSQL';