-- Add access mode columns to page_access_restrictions table
ALTER TABLE public.page_access_restrictions
ADD COLUMN IF NOT EXISTS allow_internet_access boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_internal_access boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_physical_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_download boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_screenshot boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_right_click boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_rare_book boolean DEFAULT false;