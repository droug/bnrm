-- Backfill activated_at et expires_at pour les abonnements actifs existants sans date
UPDATE service_registrations
SET 
  activated_at = COALESCE(processed_at, created_at),
  expires_at = COALESCE(processed_at, created_at) + INTERVAL '1 year',
  renewal_reminder_sent = false
WHERE status = 'active' 
  AND activated_at IS NULL;
