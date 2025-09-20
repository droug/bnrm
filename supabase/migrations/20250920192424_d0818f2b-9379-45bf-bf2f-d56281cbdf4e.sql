-- Create archiving settings table
CREATE TABLE public.archiving_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,
  auto_archive_enabled BOOLEAN DEFAULT false,
  archive_after_days INTEGER DEFAULT 365,
  archive_condition TEXT DEFAULT 'published_at', -- 'published_at', 'created_at', 'updated_at'
  exclude_featured BOOLEAN DEFAULT true,
  min_view_count INTEGER, -- Don't archive if view count is above this
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type)
);

-- Create archiving logs table
CREATE TABLE public.archiving_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_title TEXT NOT NULL,
  content_type content_type NOT NULL,
  action TEXT NOT NULL, -- 'archived', 'restored', 'skipped'
  reason TEXT,
  old_status content_status,
  new_status content_status,
  executed_by UUID, -- NULL for automatic archiving
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.archiving_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archiving_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for archiving_settings
CREATE POLICY "Admins can manage archiving settings" ON public.archiving_settings
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view archiving settings" ON public.archiving_settings
  FOR SELECT USING (true);

-- RLS policies for archiving_logs
CREATE POLICY "Admins can view archiving logs" ON public.archiving_logs
  FOR SELECT USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "System can insert archiving logs" ON public.archiving_logs
  FOR INSERT WITH CHECK (true);

-- Insert default archiving settings
INSERT INTO public.archiving_settings (content_type, auto_archive_enabled, archive_after_days, exclude_featured) VALUES
  ('news', true, 365, true),
  ('event', true, 30, false),
  ('exhibition', false, 90, true),
  ('page', false, 730, true);

-- Create trigger for archiving_settings updated_at
CREATE TRIGGER update_archiving_settings_updated_at
  BEFORE UPDATE ON public.archiving_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if content should be archived
CREATE OR REPLACE FUNCTION public.should_content_be_archived(
  content_row RECORD,
  settings_row RECORD
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reference_date TIMESTAMP WITH TIME ZONE;
  days_old INTEGER;
BEGIN
  -- If auto archive is disabled, return false
  IF NOT settings_row.auto_archive_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Don't archive featured content if exclude_featured is true
  IF settings_row.exclude_featured AND content_row.is_featured THEN
    RETURN FALSE;
  END IF;
  
  -- Don't archive content with high view count if min_view_count is set
  IF settings_row.min_view_count IS NOT NULL AND 
     content_row.view_count >= settings_row.min_view_count THEN
    RETURN FALSE;
  END IF;
  
  -- Get reference date based on archive_condition
  CASE settings_row.archive_condition
    WHEN 'published_at' THEN
      reference_date := content_row.published_at;
    WHEN 'created_at' THEN
      reference_date := content_row.created_at;
    WHEN 'updated_at' THEN
      reference_date := content_row.updated_at;
    ELSE
      reference_date := content_row.published_at;
  END CASE;
  
  -- If reference date is null, use created_at as fallback
  IF reference_date IS NULL THEN
    reference_date := content_row.created_at;
  END IF;
  
  -- Calculate days old
  days_old := EXTRACT(EPOCH FROM (NOW() - reference_date)) / 86400;
  
  -- Return true if content is older than archive_after_days
  RETURN days_old >= settings_row.archive_after_days;
END;
$$;

-- Function to perform automatic archiving
CREATE OR REPLACE FUNCTION public.perform_automatic_archiving()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_record RECORD;
  settings_record RECORD;
  archived_count INTEGER := 0;
  skipped_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Loop through all content types that have archiving enabled
  FOR settings_record IN 
    SELECT * FROM archiving_settings WHERE auto_archive_enabled = true
  LOOP
    -- Loop through published content of this type
    FOR content_record IN 
      SELECT * FROM content 
      WHERE content_type = settings_record.content_type 
      AND status = 'published'
    LOOP
      -- Check if this content should be archived
      IF should_content_be_archived(content_record, settings_record) THEN
        -- Archive the content
        UPDATE content 
        SET status = 'archived', updated_at = NOW() 
        WHERE id = content_record.id;
        
        -- Log the archiving action
        INSERT INTO archiving_logs (
          content_id, content_title, content_type, action, reason,
          old_status, new_status
        ) VALUES (
          content_record.id, content_record.title, content_record.content_type,
          'archived', 'Automatic archiving based on age',
          'published', 'archived'
        );
        
        archived_count := archived_count + 1;
      ELSE
        skipped_count := skipped_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Return summary
  result := jsonb_build_object(
    'archived_count', archived_count,
    'skipped_count', skipped_count,
    'execution_time', NOW()
  );
  
  RETURN result;
END;
$$;