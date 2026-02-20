-- Planifier la vérification quotidienne des expirations d'abonnements (tous les jours à 8h00 UTC)
SELECT cron.schedule(
  'check-subscription-expiry-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/check-subscription-expiry',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZmVwcG16bnVwenFrcW16anp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzMxNDYsImV4cCI6MjA3Mzk0OTE0Nn0._lNseTnhm88eUPMAMxeTZ-qn2vWGPm73M66lppaoSWE"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
