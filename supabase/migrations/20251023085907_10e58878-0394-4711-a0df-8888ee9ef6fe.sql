-- Table pour les modèles de documents
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_code TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  module TEXT NOT NULL,
  content_template TEXT NOT NULL,
  header_content TEXT,
  footer_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  signature_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX idx_document_templates_module ON public.document_templates(module);
CREATE INDEX idx_document_templates_type ON public.document_templates(document_type);
CREATE INDEX idx_document_templates_code ON public.document_templates(template_code);

-- Table pour l'historique de génération de documents
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.document_templates(id),
  document_number TEXT NOT NULL UNIQUE,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  document_data JSONB NOT NULL,
  signature_data JSONB,
  file_url TEXT,
  document_type TEXT NOT NULL,
  module TEXT NOT NULL
);

-- Index pour l'historique
CREATE INDEX idx_generated_docs_reference ON public.generated_documents(reference_type, reference_id);
CREATE INDEX idx_generated_docs_date ON public.generated_documents(generated_at);
CREATE INDEX idx_generated_docs_generated_by ON public.generated_documents(generated_by);

-- RLS policies pour document_templates
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer les modèles"
  ON public.document_templates
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Utilisateurs peuvent voir les modèles actifs"
  ON public.document_templates
  FOR SELECT
  USING (is_active = true);

-- RLS policies pour generated_documents
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir tous les documents générés"
  ON public.generated_documents
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Utilisateurs peuvent voir leurs documents"
  ON public.generated_documents
  FOR SELECT
  USING (generated_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Fonction pour générer le numéro de document
CREATE OR REPLACE FUNCTION generate_document_number(doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  prefix TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  
  CASE doc_type
    WHEN 'lettre_confirmation' THEN prefix := 'LC';
    WHEN 'lettre_rejet' THEN prefix := 'LR';
    WHEN 'contrat' THEN prefix := 'CT';
    WHEN 'facture' THEN prefix := 'FC';
    WHEN 'etat_lieux' THEN prefix := 'EL';
    WHEN 'compte_rendu' THEN prefix := 'CR';
    ELSE prefix := 'DOC';
  END CASE;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(document_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM generated_documents
  WHERE document_number LIKE prefix || '/' || year_suffix || '/%';
  
  RETURN prefix || '/' || year_suffix || '/' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Trigger pour générer le numéro automatiquement
CREATE OR REPLACE FUNCTION set_document_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_number IS NULL OR NEW.document_number = '' THEN
    NEW.document_number := generate_document_number(NEW.document_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER trigger_set_document_number
  BEFORE INSERT ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_document_number();

-- Trigger pour updated_at
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des modèles par défaut
INSERT INTO public.document_templates (template_name, template_code, document_type, module, content_template, variables, signature_required) VALUES
(
  'Lettre de confirmation de réservation',
  'reservation_confirmation',
  'lettre_confirmation',
  'reservations',
  E'Madame, Monsieur,\n\nNous avons le plaisir de confirmer votre réservation de l''espace {{space_name}} pour la période du {{start_date}} au {{end_date}}.\n\nDétails de la réservation :\n- Nom de l''organisme : {{organization_name}}\n- Type d''événement : {{event_type}}\n- Nombre de participants : {{participants}}\n- Durée : {{duration}}\n\nTarification :\n- Montant de base : {{base_amount}} MAD\n- Services supplémentaires : {{services_amount}} MAD\n- Montant total : {{total_amount}} MAD\n\nNous vous prions de bien vouloir prendre connaissance du contrat ci-joint et de nous le retourner signé dans les meilleurs délais.\n\nNous restons à votre disposition pour toute information complémentaire.\n\nCordialement,',
  '["space_name", "start_date", "end_date", "organization_name", "event_type", "participants", "duration", "base_amount", "services_amount", "total_amount"]'::jsonb,
  true
),
(
  'Lettre de rejet de réservation',
  'reservation_rejection',
  'lettre_rejet',
  'reservations',
  E'Madame, Monsieur,\n\nNous accusons réception de votre demande de réservation de l''espace {{space_name}} pour la période du {{start_date}} au {{end_date}}.\n\nNous sommes au regret de vous informer que nous ne pouvons donner suite à votre demande pour la raison suivante :\n\n{{rejection_reason}}\n\nNous vous remercions de l''intérêt que vous portez à la Bibliothèque Nationale du Royaume du Maroc et restons à votre disposition pour étudier d''autres dates ou espaces disponibles.\n\nCordialement,',
  '["space_name", "start_date", "end_date", "rejection_reason"]'::jsonb,
  true
),
(
  'Contrat de réservation d''espace',
  'space_contract',
  'contrat',
  'reservations',
  E'CONTRAT DE RÉSERVATION D''ESPACE\n\nEntre :\n\nLa Bibliothèque Nationale du Royaume du Maroc, représentée par {{bnrm_representative}}, ci-après dénommée "le Bailleur"\n\nEt :\n\n{{organization_name}}, représenté(e) par {{contact_name}}, ci-après dénommé(e) "le Locataire"\n\nIl a été convenu ce qui suit :\n\nArticle 1 - Objet\nLe Bailleur met à la disposition du Locataire l''espace {{space_name}} situé {{space_location}}.\n\nArticle 2 - Période de location\nDu {{start_date}} au {{end_date}}, soit une durée de {{duration}}.\n\nArticle 3 - Utilisation\nL''espace est destiné à : {{event_description}}\nNombre de participants prévus : {{participants}}\n\nArticle 4 - Conditions financières\n- Tarif de base : {{base_amount}} MAD\n- Services supplémentaires : {{services_amount}} MAD\n- Montant total : {{total_amount}} MAD\n- Modalités de paiement : {{payment_terms}}\n\nArticle 5 - Obligations du Locataire\n- Respecter les horaires convenus\n- Maintenir l''espace en bon état\n- Respecter le règlement intérieur de la BNRM\n- Souscrire une assurance responsabilité civile\n\nArticle 6 - Résiliation\nEn cas de non-respect des conditions, le Bailleur se réserve le droit de résilier le contrat.\n\nFait en deux exemplaires originaux,\nÀ Rabat, le {{contract_date}}',
  '["bnrm_representative", "organization_name", "contact_name", "space_name", "space_location", "start_date", "end_date", "duration", "event_description", "participants", "base_amount", "services_amount", "total_amount", "payment_terms", "contract_date"]'::jsonb,
  true
),
(
  'Lettre de confirmation de visite guidée',
  'tour_confirmation',
  'lettre_confirmation',
  'visites',
  E'Madame, Monsieur,\n\nNous avons le plaisir de confirmer votre réservation pour une visite guidée de la Bibliothèque Nationale du Royaume du Maroc.\n\nDétails de la visite :\n- Date : {{visit_date}}\n- Heure : {{visit_time}}\n- Type de visite : {{tour_type}}\n- Nombre de participants : {{participants}}\n- Responsable : {{contact_name}}\n- Institution : {{institution}}\n\nPoint de rendez-vous : {{meeting_point}}\n\nMerci de vous présenter 10 minutes avant l''heure prévue avec cette confirmation.\n\nNous vous prions d''agréer, Madame, Monsieur, l''expression de nos salutations distinguées.',
  '["visit_date", "visit_time", "tour_type", "participants", "contact_name", "institution", "meeting_point"]'::jsonb,
  true
),
(
  'Lettre de validation de partenariat',
  'partnership_approval',
  'lettre_confirmation',
  'partenariats',
  E'Madame, Monsieur,\n\nNous avons le plaisir de vous informer que votre demande de partenariat avec la Bibliothèque Nationale du Royaume du Maroc a été approuvée.\n\nDétails du partenariat :\n- Organisme : {{organization_name}}\n- Type : {{partnership_type}}\n- Objet : {{partnership_object}}\n- Période : du {{start_date}} au {{end_date}}\n\nObjectifs :\n{{objectives}}\n\nMoyens mis à disposition par la BNRM :\n{{bnrm_resources}}\n\nMoyens mis à disposition par l''organisme partenaire :\n{{partner_resources}}\n\nNous vous contacterons prochainement pour finaliser les modalités de notre collaboration.\n\nCordialement,',
  '["organization_name", "partnership_type", "partnership_object", "start_date", "end_date", "objectives", "bnrm_resources", "partner_resources"]'::jsonb,
  true
),
(
  'Compte rendu de programmation culturelle',
  'program_report',
  'compte_rendu',
  'programmation',
  E'COMPTE RENDU D''ACTIVITÉ CULTURELLE\n\nProposition n° {{proposal_number}}\n\nTitre : {{activity_title}}\nType d''activité : {{activity_type}}\nDate de réalisation : {{activity_date}}\nDurée : {{duration}}\n\n1. DÉROULEMENT\n\n{{event_description}}\n\n2. PARTICIPATION\n\nNombre de participants prévus : {{expected_participants}}\nNombre de participants réels : {{actual_participants}}\nTaux de participation : {{participation_rate}}%\n\n3. ÉVALUATION\n\nPoints positifs :\n{{positive_points}}\n\nPoints à améliorer :\n{{improvement_points}}\n\n4. RETOMBÉES\n\n{{impact_description}}\n\n5. RECOMMANDATIONS\n\n{{recommendations}}\n\n6. BUDGET\n\nBudget prévu : {{planned_budget}} MAD\nBudget réalisé : {{actual_budget}} MAD\nÉcart : {{budget_variance}} MAD\n\nConclusion :\n{{conclusion}}',
  '["proposal_number", "activity_title", "activity_type", "activity_date", "duration", "event_description", "expected_participants", "actual_participants", "participation_rate", "positive_points", "improvement_points", "impact_description", "recommendations", "planned_budget", "actual_budget", "budget_variance", "conclusion"]'::jsonb,
  true
);