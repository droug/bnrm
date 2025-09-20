-- Insert default publication workflow with proper JSON escaping
INSERT INTO public.workflows (name, description, workflow_type, steps) VALUES
(
  'Workflow de Publication Standard',
  'Processus de validation et publication pour le contenu standard',
  'publication',
  $workflows$[
    {
      "name": "Révision éditoriale",
      "description": "Vérification du contenu, style et qualité rédactionnelle",
      "required_role": "librarian",
      "auto_complete": false,
      "validation_criteria": ["grammar", "style", "content_quality"]
    },
    {
      "name": "Validation légale",
      "description": "Vérification de la conformité légale et des droits auteur",
      "required_role": "admin",
      "auto_complete": false,
      "validation_criteria": ["copyright", "legal_compliance"]
    },
    {
      "name": "Validation technique",
      "description": "Vérification des aspects techniques et de formatage",
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
  ]$workflows$
);

-- Insert default legal deposit workflow
INSERT INTO public.workflows (name, description, workflow_type, steps) VALUES
(
  'Dépôt Légal Standard',
  'Processus de dépôt légal pour les publications officielles',
  'legal_deposit',
  $workflows$[
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
  ]$workflows$
);