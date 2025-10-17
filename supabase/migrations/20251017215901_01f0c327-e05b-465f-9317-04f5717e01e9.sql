-- Add amazon_link field to legal_deposit_requests table
ALTER TABLE public.legal_deposit_requests 
ADD COLUMN IF NOT EXISTS amazon_link text,
ADD COLUMN IF NOT EXISTS requires_amazon_validation boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.legal_deposit_requests.amazon_link IS 'Amazon product URL for deposits with Amazon as publisher';
COMMENT ON COLUMN public.legal_deposit_requests.requires_amazon_validation IS 'Flag to indicate that this deposit requires manual Amazon validation';