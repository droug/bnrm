-- Add columns for accounting validation
ALTER TABLE reproduction_requests 
ADD COLUMN IF NOT EXISTS accounting_validator_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS accounting_validated_at timestamptz,
ADD COLUMN IF NOT EXISTS accounting_validation_notes text;