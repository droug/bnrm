-- Add columns to system_lists to support list-to-list dependencies
-- This allows linking entire lists to specific parent list values

ALTER TABLE public.system_lists
ADD COLUMN parent_list_id UUID REFERENCES public.system_lists(id) ON DELETE SET NULL,
ADD COLUMN depends_on_parent_value BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_system_lists_parent ON public.system_lists(parent_list_id);

-- Add comments
COMMENT ON COLUMN public.system_lists.parent_list_id IS 'Reference to parent list when this list depends on parent list selection';
COMMENT ON COLUMN public.system_lists.depends_on_parent_value IS 'If true, this list values are filtered based on parent list selected value';