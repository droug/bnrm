-- =============================================
-- OCR/HTR Multi-Engine Module - Database Schema
-- =============================================

-- Enum for OCR providers
CREATE TYPE public.ocr_provider AS ENUM ('tesseract', 'sanad', 'escriptorium', 'kraken');

-- Enum for document type
CREATE TYPE public.ocr_document_type AS ENUM ('printed', 'handwritten', 'mixed');

-- Enum for OCR job status
CREATE TYPE public.ocr_job_status AS ENUM ('pending', 'preprocessing', 'processing', 'completed', 'failed', 'partial');

-- =============================================
-- Table: ocr_jobs - Main OCR processing jobs
-- =============================================
CREATE TABLE public.ocr_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.digital_library_documents(id) ON DELETE SET NULL,
    
    -- Job configuration
    document_type ocr_document_type NOT NULL DEFAULT 'printed',
    selected_provider ocr_provider,
    recommended_provider ocr_provider,
    auto_mode BOOLEAN DEFAULT true,
    cloud_allowed BOOLEAN DEFAULT true,
    
    -- Source files
    source_file_url TEXT,
    source_file_name TEXT,
    source_file_hash TEXT,
    total_pages INTEGER DEFAULT 0,
    processed_pages INTEGER DEFAULT 0,
    
    -- Processing options
    preprocessing_options JSONB DEFAULT '{
        "deskew": true,
        "denoise": true,
        "binarization": "adaptive",
        "target_dpi": 300,
        "line_segmentation": false
    }'::jsonb,
    languages TEXT[] DEFAULT ARRAY['ara'],
    
    -- Status & Results
    status ocr_job_status DEFAULT 'pending',
    overall_confidence NUMERIC(5,2),
    unknown_char_ratio NUMERIC(5,4),
    processing_time_ms INTEGER,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- =============================================
-- Table: ocr_pages - Individual page results
-- =============================================
CREATE TABLE public.ocr_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.ocr_jobs(id) ON DELETE CASCADE,
    
    -- Page info
    page_number INTEGER NOT NULL,
    image_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    
    -- OCR Results
    provider_used ocr_provider,
    recognized_text TEXT,
    confidence NUMERIC(5,2),
    unknown_char_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    
    -- Segmentation data (for HTR)
    regions JSONB, -- Array of {id, type, coords, lines[]}
    line_count INTEGER DEFAULT 0,
    
    -- Additional metadata
    page_xml TEXT, -- PAGE XML format for eScriptorium
    alto_xml TEXT, -- ALTO format
    meta_json JSONB,
    
    -- Status
    status ocr_job_status DEFAULT 'pending',
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(job_id, page_number)
);

-- =============================================
-- Table: ocr_ground_truth - Human corrections
-- =============================================
CREATE TABLE public.ocr_ground_truth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.ocr_jobs(id) ON DELETE CASCADE,
    page_id UUID REFERENCES public.ocr_pages(id) ON DELETE CASCADE,
    
    -- Line identification
    page_number INTEGER NOT NULL,
    line_id TEXT, -- ID from segmentation
    line_index INTEGER, -- Sequential index
    
    -- Coordinates (for visual alignment)
    bbox JSONB, -- {x, y, width, height}
    
    -- Text comparison
    recognized_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    is_validated BOOLEAN DEFAULT false,
    
    -- Correction metadata
    correction_type TEXT, -- 'spelling', 'segmentation', 'missing', 'extra'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Table: ocr_models - Trained/fine-tuned models
-- =============================================
CREATE TABLE public.ocr_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Model identification
    provider ocr_provider NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT,
    model_path TEXT, -- Local path or remote URL
    
    -- Training info
    is_pretrained BOOLEAN DEFAULT true,
    trained_on_jobs UUID[], -- Array of job IDs used for training
    training_samples_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    accuracy NUMERIC(5,2),
    cer NUMERIC(5,4), -- Character Error Rate
    wer NUMERIC(5,4), -- Word Error Rate
    test_set_size INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Metadata
    description TEXT,
    supported_scripts TEXT[] DEFAULT ARRAY['arabic'],
    meta_json JSONB,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(provider, model_name, model_version)
);

-- =============================================
-- Table: ocr_audit_logs - Tracking & compliance
-- =============================================
CREATE TABLE public.ocr_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    job_id UUID REFERENCES public.ocr_jobs(id) ON DELETE SET NULL,
    page_id UUID REFERENCES public.ocr_pages(id) ON DELETE SET NULL,
    
    -- Action details
    action TEXT NOT NULL, -- 'upload', 'process', 'cloud_send', 'export', 'correct', 'train'
    provider ocr_provider,
    
    -- Cloud tracking (important for data sovereignty)
    sent_to_cloud BOOLEAN DEFAULT false,
    cloud_endpoint TEXT,
    file_hash TEXT,
    file_size_bytes BIGINT,
    
    -- User & context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Timing
    duration_ms INTEGER,
    
    -- Additional data
    request_data JSONB,
    response_summary JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Table: ocr_provider_configs - Admin settings
-- =============================================
CREATE TABLE public.ocr_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider ocr_provider NOT NULL UNIQUE,
    
    -- Status
    is_enabled BOOLEAN DEFAULT true,
    is_cloud BOOLEAN DEFAULT false,
    
    -- Configuration (non-sensitive)
    base_url TEXT,
    api_version TEXT,
    default_options JSONB,
    
    -- Rate limits
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    current_usage_today INTEGER DEFAULT 0,
    
    -- Notes
    description TEXT,
    documentation_url TEXT,
    
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_ocr_jobs_user_id ON public.ocr_jobs(user_id);
CREATE INDEX idx_ocr_jobs_document_id ON public.ocr_jobs(document_id);
CREATE INDEX idx_ocr_jobs_status ON public.ocr_jobs(status);
CREATE INDEX idx_ocr_jobs_created_at ON public.ocr_jobs(created_at DESC);

CREATE INDEX idx_ocr_pages_job_id ON public.ocr_pages(job_id);
CREATE INDEX idx_ocr_pages_status ON public.ocr_pages(status);

CREATE INDEX idx_ocr_ground_truth_job_id ON public.ocr_ground_truth(job_id);
CREATE INDEX idx_ocr_ground_truth_page_id ON public.ocr_ground_truth(page_id);
CREATE INDEX idx_ocr_ground_truth_validated ON public.ocr_ground_truth(is_validated) WHERE is_validated = false;

CREATE INDEX idx_ocr_audit_logs_job_id ON public.ocr_audit_logs(job_id);
CREATE INDEX idx_ocr_audit_logs_action ON public.ocr_audit_logs(action);
CREATE INDEX idx_ocr_audit_logs_created_at ON public.ocr_audit_logs(created_at DESC);
CREATE INDEX idx_ocr_audit_logs_cloud ON public.ocr_audit_logs(sent_to_cloud) WHERE sent_to_cloud = true;

-- =============================================
-- Enable RLS
-- =============================================
ALTER TABLE public.ocr_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_ground_truth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_provider_configs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- ocr_jobs: Users can see their own jobs, admins/librarians see all
CREATE POLICY "Users can view their own OCR jobs"
ON public.ocr_jobs FOR SELECT
USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'librarian')
);

CREATE POLICY "Authenticated users can create OCR jobs"
ON public.ocr_jobs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OCR jobs"
ON public.ocr_jobs FOR UPDATE
USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'librarian')
);

-- ocr_pages: Follow job access
CREATE POLICY "Users can view pages of their OCR jobs"
ON public.ocr_pages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ocr_jobs 
        WHERE id = ocr_pages.job_id 
        AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'))
    )
);

CREATE POLICY "System can insert OCR pages"
ON public.ocr_pages FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ocr_jobs 
        WHERE id = ocr_pages.job_id 
        AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'))
    )
);

CREATE POLICY "System can update OCR pages"
ON public.ocr_pages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.ocr_jobs 
        WHERE id = ocr_pages.job_id 
        AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'))
    )
);

-- ocr_ground_truth: Authenticated users can contribute corrections
CREATE POLICY "Users can view ground truth"
ON public.ocr_ground_truth FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert corrections"
ON public.ocr_ground_truth FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own corrections"
ON public.ocr_ground_truth FOR UPDATE
USING (
    auth.uid() = created_by 
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'librarian')
);

-- ocr_models: Public read, admin write
CREATE POLICY "Anyone can view OCR models"
ON public.ocr_models FOR SELECT
USING (true);

CREATE POLICY "Admins can manage OCR models"
ON public.ocr_models FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ocr_audit_logs: Admins only
CREATE POLICY "Admins can view audit logs"
ON public.ocr_audit_logs FOR SELECT
USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'librarian')
);

CREATE POLICY "System can insert audit logs"
ON public.ocr_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ocr_provider_configs: Public read, admin write
CREATE POLICY "Anyone can view provider configs"
ON public.ocr_provider_configs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage provider configs"
ON public.ocr_provider_configs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Trigger for updated_at
-- =============================================
CREATE TRIGGER update_ocr_jobs_updated_at
    BEFORE UPDATE ON public.ocr_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_pages_updated_at
    BEFORE UPDATE ON public.ocr_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_ground_truth_updated_at
    BEFORE UPDATE ON public.ocr_ground_truth
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_models_updated_at
    BEFORE UPDATE ON public.ocr_models
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_provider_configs_updated_at
    BEFORE UPDATE ON public.ocr_provider_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Insert default provider configurations
-- =============================================
INSERT INTO public.ocr_provider_configs (provider, is_enabled, is_cloud, description, documentation_url, default_options) VALUES
('tesseract', true, false, 'Tesseract OCR - Local engine for printed Arabic text', 'https://tesseract-ocr.github.io/', '{"lang": "ara", "oem": 3, "psm": 3}'::jsonb),
('sanad', false, true, 'Sanad.ai OCR - Cloud API for Arabic documents (requires API key)', 'https://sanad.ai/docs', '{"output_format": "text", "confidence_threshold": 0.8}'::jsonb),
('escriptorium', false, false, 'eScriptorium/Kraken - HTR for handwritten manuscripts', 'https://escriptorium.readthedocs.io/', '{"segmentation": "auto", "model": "default_arabic"}'::jsonb),
('kraken', false, false, 'Kraken OCR - Direct HTR engine', 'https://kraken.re/', '{"model": "arabic_best", "bidi_reorder": true}'::jsonb);

-- =============================================
-- Insert default Arabic model entries
-- =============================================
INSERT INTO public.ocr_models (provider, model_name, model_version, is_pretrained, is_default, description, supported_scripts) VALUES
('tesseract', 'ara', '4.1', true, true, 'Tesseract Arabic model (LSTM)', ARRAY['arabic']),
('tesseract', 'ara_number', '4.1', true, false, 'Arabic with improved number recognition', ARRAY['arabic']),
('kraken', 'arabic_best', '2.0', true, true, 'Kraken best Arabic HTR model', ARRAY['arabic', 'arabic_manuscript']);