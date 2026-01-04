-- Table for electronic bundles/subscriptions
CREATE TABLE public.electronic_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  provider VARCHAR(255) NOT NULL,
  provider_logo_url TEXT,
  website_url TEXT,
  api_base_url TEXT,
  api_key_name VARCHAR(100),
  api_authentication_type VARCHAR(50) DEFAULT 'api_key',
  api_headers JSONB DEFAULT '{}',
  api_query_params JSONB DEFAULT '{}',
  ip_authentication BOOLEAN DEFAULT false,
  ip_ranges TEXT[],
  access_type VARCHAR(50) DEFAULT 'subscription',
  subscription_start_date DATE,
  subscription_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  document_count INTEGER DEFAULT 0,
  categories TEXT[],
  subjects TEXT[],
  supported_formats TEXT[],
  search_endpoint TEXT,
  fulltext_endpoint TEXT,
  metadata_endpoint TEXT,
  proxy_required BOOLEAN DEFAULT false,
  proxy_url TEXT,
  notes TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.electronic_bundles ENABLE ROW LEVEL SECURITY;

-- Public read policy for active bundles
CREATE POLICY "Anyone can view active electronic bundles"
ON public.electronic_bundles
FOR SELECT
USING (is_active = true);

-- Admin/librarian full access policy using user_roles table
CREATE POLICY "Librarians can manage electronic bundles"
ON public.electronic_bundles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Add indexes
CREATE INDEX idx_electronic_bundles_active ON public.electronic_bundles(is_active);
CREATE INDEX idx_electronic_bundles_provider ON public.electronic_bundles(provider);
CREATE INDEX idx_electronic_bundles_sort ON public.electronic_bundles(sort_order);

-- Add trigger for updated_at
CREATE TRIGGER update_electronic_bundles_updated_at
BEFORE UPDATE ON public.electronic_bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.electronic_bundles IS 'Electronic resource bundles/subscriptions for the digital library';