-- Create workflow tables for publication and legal deposit

-- Create workflows table to define publication and legal deposit workflows
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('publication', 'legal_deposit')),
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_instances table to track workflow executions
CREATE TABLE public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')),
  started_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_step_executions table to track individual step executions
CREATE TABLE public.workflow_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'skipped')),
  assigned_to UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_validation table for validation requirements
CREATE TABLE public.content_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  validation_type TEXT NOT NULL CHECK (validation_type IN ('editorial', 'legal', 'technical', 'quality')),
  validator_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  comments TEXT,
  validation_criteria JSONB DEFAULT '{}',
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, validation_type)
);

-- Create legal_deposits table for legal deposit tracking
CREATE TABLE public.legal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  deposit_number TEXT UNIQUE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledgment_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'processed', 'archived', 'rejected')),
  deposit_type TEXT NOT NULL CHECK (deposit_type IN ('mandatory', 'voluntary', 'special')),
  submitter_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_deposits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
CREATE POLICY "Admins can manage workflows" ON public.workflows
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view active workflows" ON public.workflows
  FOR SELECT USING (is_active = true);

-- RLS Policies for workflow_instances
CREATE POLICY "Admins can manage workflow instances" ON public.workflow_instances
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Content authors can view their workflow instances" ON public.workflow_instances
  FOR SELECT USING (
    started_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM content WHERE content.id = workflow_instances.content_id AND content.author_id = auth.uid())
  );

-- RLS Policies for workflow_step_executions
CREATE POLICY "Admins can manage step executions" ON public.workflow_step_executions
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Assigned users can view and update their steps" ON public.workflow_step_executions
  FOR ALL USING (assigned_to = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- RLS Policies for content_validation
CREATE POLICY "Admins can manage content validation" ON public.content_validation
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Validators can manage their validations" ON public.content_validation
  FOR ALL USING (validator_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Content authors can view validations for their content" ON public.content_validation
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM content WHERE content.id = content_validation.content_id AND content.author_id = auth.uid())
  );

-- RLS Policies for legal_deposits
CREATE POLICY "Admins can manage legal deposits" ON public.legal_deposits
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Submitters can view their deposits" ON public.legal_deposits
  FOR SELECT USING (submitter_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON public.workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_step_executions_updated_at
  BEFORE UPDATE ON public.workflow_step_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_validation_updated_at
  BEFORE UPDATE ON public.content_validation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_deposits_updated_at
  BEFORE UPDATE ON public.legal_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default publication workflow
INSERT INTO public.workflows (name, description, workflow_type, steps) VALUES
(
  'Workflow de Publication Standard',
  'Processus de validation et publication pour le contenu standard',
  'publication',
  '[
    {
      "name": "Révision éditoriale",
      "description": "Vérification du contenu, style et qualité rédactionnelle",
      "required_role": "librarian",
      "auto_complete": false,
      "validation_criteria": ["grammar", "style", "content_quality"]
    },
    {
      "name": "Validation légale",
      "description": "Vérification de la conformité légale et des droits d\'auteur",
      "required_role": "admin",
      "auto_complete": false,
      "validation_criteria": ["copyright", "legal_compliance"]
    },
    {
      "name": "Validation technique",
      "description": "Vérification des aspects techniques et de la formatage",
      "required_role": "librarian",
      "auto_complete": false,
      "validation_criteria": ["formatting", "links", "images"]
    },
    {
      "name": "Approbation finale",
      "description": "Approbation finale pour publication",
      "required_role": "admin",
      "auto_complete": false,
      "validation_criteria": ["final_approval"]
    },
    {
      "name": "Publication",
      "description": "Mise en ligne du contenu",
      "required_role": "system",
      "auto_complete": true,
      "validation_criteria": []
    }
  ]'
);

-- Insert default legal deposit workflow
INSERT INTO public.workflows (name, description, workflow_type, steps) VALUES
(
  'Dépôt Légal Standard',
  'Processus de dépôt légal pour les publications officielles',
  'legal_deposit',
  '[
    {
      "name": "Préparation du dossier",
      "description": "Rassemblement des documents nécessaires",
      "required_role": "librarian",
      "auto_complete": false,
      "validation_criteria": ["document_completeness", "metadata_quality"]
    },
    {
      "name": "Vérification administrative",
      "description": "Contrôle des informations administratives",
      "required_role": "admin",
      "auto_complete": false,
      "validation_criteria": ["administrative_data", "legal_requirements"]
    },
    {
      "name": "Attribution du numéro de dépôt",
      "description": "Génération du numéro de dépôt légal",
      "required_role": "system",
      "auto_complete": true,
      "validation_criteria": []
    },
    {
      "name": "Enregistrement officiel",
      "description": "Enregistrement dans le registre officiel",
      "required_role": "admin",
      "auto_complete": false,
      "validation_criteria": ["official_registration"]
    },
    {
      "name": "Archivage",
      "description": "Archivage permanent du dépôt",
      "required_role": "system",
      "auto_complete": true,
      "validation_criteria": []
    }
  ]'
);

-- Create function to generate deposit numbers
CREATE OR REPLACE FUNCTION public.generate_deposit_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  sequence_num INTEGER;
  deposit_number TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(deposit_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM legal_deposits
  WHERE deposit_number LIKE 'DL-' || year_str || '-%';
  
  deposit_number := 'DL-' || year_str || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN deposit_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;