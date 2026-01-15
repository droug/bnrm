-- Add view mode columns to page_access_restrictions table
ALTER TABLE public.page_access_restrictions
ADD COLUMN IF NOT EXISTS allow_double_page_view boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_scroll_view boolean DEFAULT true;