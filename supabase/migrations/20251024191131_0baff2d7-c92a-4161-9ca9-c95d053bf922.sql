-- Corriger les statuts existants pour correspondre aux dernières décisions
UPDATE bookings b
SET status = CASE 
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'confirmee' THEN 'confirmee'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'validee' THEN 'validee'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'en_contrat' THEN 'en_contrat'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'facturee' THEN 'facturee'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'refusee' THEN 'rejetee'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'verification_en_cours' THEN 'verification_en_cours'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'cloturee' THEN 'cloturee'
  WHEN (
    SELECT decision 
    FROM booking_workflow_history 
    WHERE booking_id = b.id 
    ORDER BY processed_at DESC 
    LIMIT 1
  ) = 'archivee_sans_suite' THEN 'archivee_sans_suite'
  ELSE b.status
END
WHERE EXISTS (
  SELECT 1 
  FROM booking_workflow_history 
  WHERE booking_id = b.id
);