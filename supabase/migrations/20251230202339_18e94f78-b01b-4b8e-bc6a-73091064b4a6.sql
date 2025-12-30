-- Add column for restricted page display mode
ALTER TABLE page_access_restrictions 
ADD COLUMN IF NOT EXISTS restricted_page_display TEXT DEFAULT 'blur' 
CHECK (restricted_page_display IN ('blur', 'empty', 'hidden'));