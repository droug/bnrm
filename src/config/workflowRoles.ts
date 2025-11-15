/**
 * RÔLES DE WORKFLOW
 * 
 * Ces rôles sont stockés dans la table 'workflow_roles' (type TEXT, pas enum)
 * Ils sont utilisés pour gérer les étapes et transitions des workflows métier
 * 
 * ⚠️ DISTINCTION IMPORTANTE:
 * - user_roles (enum) → Contrôle d'accès principal, RLS policies
 * - workflow_roles (table) → Rôles spécifiques aux processus métier
 * 
 * Ces rôles sont assignés via la table 'workflow_user_roles'
 */

export interface WorkflowRole {
  role_name: string;
  module: string;
  role_level: 'system' | 'admin' | 'module' | 'user';
  description: string;
  permissions?: string[];
  workflow_actions?: string[];
}

/**
 * RÔLES DE WORKFLOW PAR MODULE
 */

// === MODULE: DÉPÔT LÉGAL ===
export const LEGAL_DEPOSIT_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Auteur/Éditeur',
    module: 'legal_deposit',
    role_level: 'user',
    description: 'Dépose des publications dans le cadre du dépôt légal',
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Agent Dépôt Légal',
    module: 'legal_deposit',
    role_level: 'module',
    description: 'Traite les demandes de dépôt légal',
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Validateur BN',
    module: 'legal_deposit',
    role_level: 'module',
    description: 'Valide les publications pour la Bibliothèque Nationale',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
  {
    role_name: 'dl_validator',
    module: 'legal_deposit',
    role_level: 'module',
    description: 'Validateur technique du dépôt légal',
    workflow_actions: ['validate', 'execute_step', 'view_instances'],
  },
];

// === MODULE: CATALOGAGE ===
export const CATALOGING_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Catalogueur',
    module: 'cataloging',
    role_level: 'module',
    description: 'Crée et modifie les notices catalographiques',
    workflow_actions: ['submit', 'execute_step'],
  },
  {
    role_name: 'Responsable Validation',
    module: 'cataloging',
    role_level: 'module',
    description: 'Valide les notices catalographiques',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
];

// === MODULE: GED (Gestion Électronique de Documents) ===
export const GED_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Agent Numérisation',
    module: 'ged',
    role_level: 'module',
    description: 'Numérise les documents',
    workflow_actions: ['submit', 'execute_step'],
  },
  {
    role_name: 'Contrôleur Qualité',
    module: 'ged',
    role_level: 'module',
    description: 'Contrôle la qualité des numérisations',
    workflow_actions: ['validate', 'reject'],
  },
  {
    role_name: 'Responsable GED',
    module: 'ged',
    role_level: 'module',
    description: 'Supervise la GED',
    workflow_actions: ['validate', 'approve', 'assign'],
  },
  {
    role_name: 'Archiviste GED',
    module: 'ged',
    role_level: 'system',
    description: 'Archive les documents numériques',
    workflow_actions: ['execute_step', 'complete'],
  },
  {
    role_name: 'ged_controller',
    module: 'ged',
    role_level: 'module',
    description: 'Contrôleur technique GED',
    workflow_actions: ['execute_step', 'view_instances'],
  },
];

// === MODULE: CBM (Catalogue Bibliographique Marocain) ===
export const CBM_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Bibliothèque Partenaire',
    module: 'cbm',
    role_level: 'user',
    description: 'Bibliothèque adhérente au CBM',
    workflow_actions: ['submit', 'view_instances'],
  },
  {
    role_name: 'Coordinateur CBM',
    module: 'cbm',
    role_level: 'module',
    description: 'Coordonne les activités du CBM',
    workflow_actions: ['validate', 'assign', 'execute_step'],
  },
  {
    role_name: 'Coordinateur CBM Adhésions',
    module: 'cbm',
    role_level: 'module',
    description: 'Gère les adhésions au CBM',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
  {
    role_name: 'Administrateur CBM',
    module: 'cbm',
    role_level: 'admin',
    description: 'Administre la plateforme CBM',
    workflow_actions: ['validate', 'approve', 'reject', 'cancel', 'reopen'],
  },
  {
    role_name: 'cbm_coordinator',
    module: 'cbm',
    role_level: 'module',
    description: 'Coordinateur technique CBM',
    workflow_actions: ['execute_step', 'view_instances', 'assign_step'],
  },
];

// === MODULE: INSCRIPTIONS ===
export const INSCRIPTION_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Agent Inscription',
    module: 'inscription',
    role_level: 'module',
    description: 'Traite les demandes d\'inscription',
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Service',
    module: 'inscription',
    role_level: 'module',
    description: 'Supervise les inscriptions',
    workflow_actions: ['validate', 'approve', 'reject', 'cancel'],
  },
];

// === MODULE: RESTAURATION ===
export const RESTORATION_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Gestionnaire Restauration',
    module: 'restoration',
    role_level: 'module',
    description: 'Gère les demandes de restauration',
    workflow_actions: ['submit', 'assign'],
  },
  {
    role_name: 'Expert Restauration',
    module: 'restoration',
    role_level: 'module',
    description: 'Évalue les besoins de restauration',
    workflow_actions: ['validate', 'execute_step'],
  },
  {
    role_name: 'Restaurateur',
    module: 'restoration',
    role_level: 'module',
    description: 'Effectue la restauration',
    workflow_actions: ['execute_step', 'complete'],
  },
];

// === MODULE: REPRODUCTION ===
export const REPRODUCTION_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Agent Reproduction',
    module: 'reproduction',
    role_level: 'module',
    description: 'Traite les demandes de reproduction',
    workflow_actions: ['validate', 'assign'],
  },
  {
    role_name: 'Technicien Reproduction',
    module: 'reproduction',
    role_level: 'module',
    description: 'Effectue les reproductions',
    workflow_actions: ['execute_step', 'complete'],
  },
];

// === MODULE: ACTIVITÉS CULTURELLES ===
export const CULTURAL_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Gestionnaire Activités Culturelles',
    module: 'cultural',
    role_level: 'module',
    description: 'Gère les activités culturelles',
    workflow_actions: ['submit', 'assign'],
  },
  {
    role_name: 'Département Action Culturelle',
    module: 'cultural',
    role_level: 'module',
    description: 'Valide les activités culturelles',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
  {
    role_name: 'Gestionnaire Visites',
    module: 'cultural',
    role_level: 'module',
    description: 'Organise les visites guidées',
    workflow_actions: ['submit', 'execute_step'],
  },
  {
    role_name: 'Guide',
    module: 'cultural',
    role_level: 'user',
    description: 'Effectue les visites guidées',
    workflow_actions: ['execute_step', 'complete'],
  },
  {
    role_name: 'Gestionnaire Espaces',
    module: 'cultural',
    role_level: 'module',
    description: 'Gère les espaces culturels',
    workflow_actions: ['validate', 'assign', 'approve'],
  },
];

// === MODULE: ADMINISTRATION ===
export const ADMIN_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Administrateur BNRM',
    module: 'bnrm',
    role_level: 'admin',
    description: 'Administrateur de la plateforme BNRM',
    workflow_actions: ['validate', 'approve', 'reject', 'cancel', 'reopen'],
  },
  {
    role_name: 'Direction BNRM',
    module: 'bnrm',
    role_level: 'admin',
    description: 'Direction de la BNRM',
    workflow_actions: ['approve', 'reject', 'cancel'],
  },
  {
    role_name: 'DAC',
    module: 'bnrm',
    role_level: 'admin',
    description: 'Direction des Affaires Culturelles',
    workflow_actions: ['approve', 'validate'],
  },
  {
    role_name: 'Bureau d\'ordre',
    module: 'bnrm',
    role_level: 'module',
    description: 'Bureau d\'ordre administratif',
    workflow_actions: ['submit', 'assign'],
  },
  {
    role_name: 'Service Financier',
    module: 'bnrm',
    role_level: 'module',
    description: 'Service financier',
    workflow_actions: ['validate', 'execute_step'],
  },
  {
    role_name: 'Service Comptabilité',
    module: 'bnrm',
    role_level: 'module',
    description: 'Service comptabilité',
    workflow_actions: ['validate', 'execute_step'],
  },
  {
    role_name: 'Gestionnaire Financier',
    module: 'bnrm',
    role_level: 'module',
    description: 'Gère les aspects financiers',
    workflow_actions: ['validate', 'approve'],
  },
  {
    role_name: 'Responsable e-Payment',
    module: 'payment',
    role_level: 'module',
    description: 'Gère les paiements électroniques',
    workflow_actions: ['validate', 'execute_step'],
  },
  {
    role_name: 'payment_validator',
    module: 'payment',
    role_level: 'module',
    description: 'Validateur technique des paiements',
    workflow_actions: ['execute_step', 'view_instances'],
  },
];

// === MODULE: WORKFLOW SYSTÈME ===
export const SYSTEM_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'workflow_admin',
    module: 'global',
    role_level: 'system',
    description: 'Administrateur de workflow',
    permissions: ['*'],
    workflow_actions: ['validate', 'approve', 'reject', 'cancel', 'reopen', 'assign'],
  },
  {
    role_name: 'workflow_manager',
    module: 'global',
    role_level: 'system',
    description: 'Gestionnaire de workflow',
    permissions: ['view_workflows', 'view_instances', 'view_metrics'],
    workflow_actions: ['view_instances'],
  },
];

// === RÔLES DIVERS ===
export const OTHER_WORKFLOW_ROLES: WorkflowRole[] = [
  {
    role_name: 'Administrateur Portail',
    module: 'portal',
    role_level: 'admin',
    description: 'Administre le portail web',
    workflow_actions: ['validate', 'approve'],
  },
  {
    role_name: 'Rédacteur',
    module: 'content',
    role_level: 'module',
    description: 'Rédige du contenu',
    workflow_actions: ['submit', 'execute_step'],
  },
  {
    role_name: 'Responsable Éditorial',
    module: 'content',
    role_level: 'module',
    description: 'Valide le contenu éditorial',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
  {
    role_name: 'Directeur Conservation',
    module: 'conservation',
    role_level: 'admin',
    description: 'Directeur de la conservation',
    workflow_actions: ['approve', 'validate'],
  },
  {
    role_name: 'Analyste',
    module: 'reporting',
    role_level: 'module',
    description: 'Analyse les données',
    workflow_actions: ['view_instances'],
  },
  {
    role_name: 'Administrateur Reporting',
    module: 'reporting',
    role_level: 'admin',
    description: 'Administre le reporting',
    workflow_actions: ['view_instances', 'view_metrics'],
  },
  {
    role_name: 'Responsable Suivi-Évaluation',
    module: 'monitoring',
    role_level: 'module',
    description: 'Suit et évalue les processus',
    workflow_actions: ['view_instances', 'view_metrics'],
  },
  {
    role_name: 'Service Juridique',
    module: 'legal',
    role_level: 'module',
    description: 'Service juridique',
    workflow_actions: ['validate', 'approve'],
  },
  {
    role_name: 'Service Bâtiment',
    module: 'facilities',
    role_level: 'module',
    description: 'Service bâtiment',
    workflow_actions: ['execute_step'],
  },
  {
    role_name: 'Utilisateur',
    module: 'general',
    role_level: 'user',
    description: 'Utilisateur général',
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Utilisateur Demandeur',
    module: 'general',
    role_level: 'user',
    description: 'Utilisateur effectuant une demande',
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Visiteur',
    module: 'general',
    role_level: 'user',
    description: 'Visiteur du site',
    workflow_actions: [],
  },
  {
    role_name: 'Archiviste',
    module: 'archive',
    role_level: 'module',
    description: 'Gère les archives',
    workflow_actions: ['execute_step', 'complete'],
  },
  {
    role_name: 'Directeur BNRM',
    module: 'bnrm',
    role_level: 'admin',
    description: 'Directeur général de la BNRM',
    workflow_actions: ['approve', 'cancel'],
  },
  {
    role_name: 'Direction',
    module: 'bnrm',
    role_level: 'admin',
    description: 'Direction générale',
    workflow_actions: ['approve', 'cancel'],
  },
  {
    role_name: 'Gestionnaire Adhésions',
    module: 'adhesion',
    role_level: 'module',
    description: 'Gère les adhésions',
    workflow_actions: ['validate', 'approve', 'reject'],
  },
];

/**
 * TOUS LES RÔLES DE WORKFLOW
 */
export const ALL_WORKFLOW_ROLES: WorkflowRole[] = [
  ...LEGAL_DEPOSIT_WORKFLOW_ROLES,
  ...CATALOGING_WORKFLOW_ROLES,
  ...GED_WORKFLOW_ROLES,
  ...CBM_WORKFLOW_ROLES,
  ...INSCRIPTION_WORKFLOW_ROLES,
  ...RESTORATION_WORKFLOW_ROLES,
  ...REPRODUCTION_WORKFLOW_ROLES,
  ...CULTURAL_WORKFLOW_ROLES,
  ...ADMIN_WORKFLOW_ROLES,
  ...SYSTEM_WORKFLOW_ROLES,
  ...OTHER_WORKFLOW_ROLES,
];

/**
 * Obtenir les rôles par module
 */
export function getWorkflowRolesByModule(module: string): WorkflowRole[] {
  return ALL_WORKFLOW_ROLES.filter(role => role.module === module);
}

/**
 * Obtenir les rôles par niveau
 */
export function getWorkflowRolesByLevel(level: WorkflowRole['role_level']): WorkflowRole[] {
  return ALL_WORKFLOW_ROLES.filter(role => role.role_level === level);
}

/**
 * Rechercher un rôle par nom
 */
export function findWorkflowRole(roleName: string): WorkflowRole | undefined {
  return ALL_WORKFLOW_ROLES.find(role => role.role_name === roleName);
}

/**
 * Obtenir tous les modules disponibles
 */
export function getAvailableModules(): string[] {
  return Array.from(new Set(ALL_WORKFLOW_ROLES.map(role => role.module)));
}
