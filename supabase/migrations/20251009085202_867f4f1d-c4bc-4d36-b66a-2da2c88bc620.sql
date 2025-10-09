-- Add validation workflow columns to legal_deposit_requests table
ALTER TABLE legal_deposit_requests
ADD COLUMN IF NOT EXISTS validated_by_service uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS service_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS service_validation_notes text,
ADD COLUMN IF NOT EXISTS validated_by_department uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS department_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS department_validation_notes text,
ADD COLUMN IF NOT EXISTS validated_by_committee uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS committee_validated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS committee_validation_notes text,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_legal_deposit_requests_service_validation ON legal_deposit_requests(validated_by_service, service_validated_at);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_requests_department_validation ON legal_deposit_requests(validated_by_department, department_validated_at);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_requests_committee_validation ON legal_deposit_requests(validated_by_committee, committee_validated_at);