-- Add parent_value_id column to system_list_values for hierarchical relationships
-- This allows linking disciplines to publication types, for example

ALTER TABLE public.system_list_values
ADD COLUMN parent_value_id UUID REFERENCES public.system_list_values(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_system_list_values_parent ON public.system_list_values(parent_value_id);

-- Add comment
COMMENT ON COLUMN public.system_list_values.parent_value_id IS 'Reference to parent value for hierarchical relationships (e.g., linking disciplines to publication types)';