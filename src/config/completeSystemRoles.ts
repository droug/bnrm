/**
 * Configuration complète de tous les rôles du système BNRM
 * Incluant: inscriptions, adhésions, workflows et transitions
 */

export interface CompleteSystemRole {
  role_name: string;
  role_level: string;
  module: string;
  description: string;
  permissions: string[];
  can_manage_transitions?: boolean;
  workflow_actions?: string[];
}

/**
 * RÔLES SYSTÈME COMPLETS
 * Détectés à partir de tous les modules et workflows du système
 */
export const COMPLETE_SYSTEM_ROLES: CompleteSystemRole[] = [
  // ==================== RÔLES D'ADMINISTRATION ====================
  {
    role_name: 'Administrateur Système',
    role_level: 'system',
    module: 'system',
    description: 'Administrateur avec accès complet à tous les modules et workflows',
    permissions: [
      'admin.full_access',
      'workflow.transition.*',
      'workflow.manage_all',
      'roles.manage',
      'users.manage',
      'system.configure',
    ],
    can_manage_transitions: true,
    workflow_actions: ['submit', 'validate', 'reject', 'approve', 'assign', 'complete', 'cancel', 'reopen'],
  },
  {
    role_name: 'Administrateur BNRM',
    role_level: 'admin',
    module: 'bnrm',
    description: 'Administrateur de la plateforme BNRM',
    permissions: [
      'admin.full_access',
      'bnrm.manage_all',
      'workflow.manage_bnrm',
      'inscriptions.manage',
      'adhesions.manage',
      'services.manage',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'approve', 'cancel', 'reopen'],
  },
  {
    role_name: 'Bibliothécaire',
    role_level: 'admin',
    module: 'library',
    description: 'Bibliothécaire avec accès aux fonctions de gestion bibliothécaire',
    permissions: [
      'librarian.manage',
      'catalog.manage',
      'manuscripts.view',
      'digital_library.manage',
      'workflow.view_all',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },

  // ==================== RÔLES D'INSCRIPTION ====================
  {
    role_name: 'Agent Inscription',
    role_level: 'module',
    module: 'inscription',
    description: 'Gère les demandes d\'inscription des usagers (étudiants, grand public, pass jeunes)',
    permissions: [
      'inscription.view_all',
      'inscription.validate',
      'inscription.reject',
      'inscription.create',
      'inscription.update',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Inscriptions',
    role_level: 'module',
    module: 'inscription',
    description: 'Supervise et valide toutes les inscriptions',
    permissions: [
      'inscription.view_all',
      'inscription.validate',
      'inscription.reject',
      'inscription.approve',
      'inscription.cancel',
      'inscription.renew',
      'workflow.transition.approve',
      'workflow.transition.cancel',
      'workflow.transition.reopen',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'approve', 'cancel', 'reopen'],
  },
  {
    role_name: 'Inscrit - Étudiant',
    role_level: 'user',
    module: 'inscription',
    description: 'Usager inscrit en tant qu\'étudiant/chercheur',
    permissions: [
      'inscription.view_own',
      'inscription.renew',
      'services.access_reading_rooms',
      'services.request_documents',
      'digital_library.access_restricted',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Inscrit - Grand Public',
    role_level: 'user',
    module: 'inscription',
    description: 'Usager inscrit grand public',
    permissions: [
      'inscription.view_own',
      'inscription.renew',
      'services.access_main_room',
      'services.request_documents',
      'digital_library.access_public',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Inscrit - Pass Jeunes',
    role_level: 'user',
    module: 'inscription',
    description: 'Jeune inscrit avec pass jeunes (15-25 ans)',
    permissions: [
      'inscription.view_own',
      'inscription.renew',
      'services.access_youth_space',
      'services.access_main_room',
      'digital_library.access_public',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },

  // ==================== RÔLES D'ADHÉSION ====================
  {
    role_name: 'Gestionnaire Adhésions',
    role_level: 'module',
    module: 'adhesion',
    description: 'Gère les adhésions et abonnements des usagers',
    permissions: [
      'adhesion.view_all',
      'adhesion.validate',
      'adhesion.reject',
      'adhesion.create',
      'adhesion.update',
      'adhesion.suspend',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Adhésions',
    role_level: 'module',
    module: 'adhesion',
    description: 'Supervise toutes les adhésions',
    permissions: [
      'adhesion.view_all',
      'adhesion.validate',
      'adhesion.reject',
      'adhesion.approve',
      'adhesion.cancel',
      'adhesion.renew',
      'adhesion.suspend',
      'workflow.transition.approve',
      'workflow.transition.cancel',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'approve', 'cancel', 'reopen'],
  },
  {
    role_name: 'Adhérent Premium',
    role_level: 'user',
    module: 'adhesion',
    description: 'Adhérent avec accès premium et services étendus',
    permissions: [
      'adhesion.view_own',
      'services.priority_access',
      'services.advanced_search',
      'digital_library.access_extended',
      'reproduction.priority',
      'manuscripts.request_access',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Adhérent Chercheur',
    role_level: 'user',
    module: 'adhesion',
    description: 'Chercheur adhérent avec accès aux collections spéciales',
    permissions: [
      'adhesion.view_own',
      'services.researcher_access',
      'manuscripts.request_access',
      'manuscripts.view_restricted',
      'digital_library.access_research',
      'reproduction.advanced',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },

  // ==================== RÔLES DÉPÔT LÉGAL ====================
  {
    role_name: 'Agent Dépôt Légal',
    role_level: 'module',
    module: 'legal_deposit',
    description: 'Traite les dépôts légaux de publications',
    permissions: [
      'legal_deposit.view_all',
      'legal_deposit.process',
      'legal_deposit.validate',
      'workflow.transition.validate',
      'workflow.transition.assign',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Dépôt Légal',
    role_level: 'module',
    module: 'legal_deposit',
    description: 'Supervise le processus de dépôt légal',
    permissions: [
      'legal_deposit.view_all',
      'legal_deposit.approve',
      'legal_deposit.reject',
      'workflow.transition.approve',
      'workflow.transition.reject',
      'workflow.transition.reopen',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'cancel', 'reopen'],
  },
  {
    role_name: 'Archiviste GED',
    role_level: 'system',
    module: 'legal_deposit',
    description: 'Gère l\'archivage numérique des dépôts',
    permissions: [
      'ged.archive',
      'ged.view_all',
      'legal_deposit.archive',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['complete'],
  },
  {
    role_name: 'Déposant - Éditeur',
    role_level: 'user',
    module: 'legal_deposit',
    description: 'Éditeur effectuant des dépôts légaux',
    permissions: [
      'legal_deposit.create',
      'legal_deposit.view_own',
      'legal_deposit.submit',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Déposant - Imprimeur',
    role_level: 'user',
    module: 'legal_deposit',
    description: 'Imprimeur effectuant des dépôts légaux',
    permissions: [
      'legal_deposit.create',
      'legal_deposit.view_own',
      'legal_deposit.submit',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Déposant - Producteur',
    role_level: 'user',
    module: 'legal_deposit',
    description: 'Producteur effectuant des dépôts légaux',
    permissions: [
      'legal_deposit.create',
      'legal_deposit.view_own',
      'legal_deposit.submit',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Déposant - Distributeur',
    role_level: 'user',
    module: 'legal_deposit',
    description: 'Distributeur effectuant des dépôts légaux',
    permissions: [
      'legal_deposit.create',
      'legal_deposit.view_own',
      'legal_deposit.submit',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },

  // ==================== RÔLES ISBN/ISSN ====================
  {
    role_name: 'Agent ISBN/ISSN',
    role_level: 'module',
    module: 'isbn_issn',
    description: 'Traite les demandes d\'ISBN et ISSN',
    permissions: [
      'isbn.view_all',
      'isbn.assign',
      'issn.view_all',
      'issn.assign',
      'workflow.transition.validate',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'complete'],
  },
  {
    role_name: 'Responsable ISBN/ISSN',
    role_level: 'module',
    module: 'isbn_issn',
    description: 'Supervise l\'attribution des ISBN/ISSN',
    permissions: [
      'isbn.manage',
      'issn.manage',
      'workflow.transition.approve',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'reopen'],
  },

  // ==================== RÔLES REPRODUCTION ====================
  {
    role_name: 'Agent Reproduction',
    role_level: 'module',
    module: 'reproduction',
    description: 'Traite les demandes de reproduction de documents',
    permissions: [
      'reproduction.view_all',
      'reproduction.process',
      'reproduction.validate',
      'workflow.transition.validate',
      'workflow.transition.assign',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign', 'complete'],
  },
  {
    role_name: 'Responsable Reproduction',
    role_level: 'module',
    module: 'reproduction',
    description: 'Supervise les demandes de reproduction',
    permissions: [
      'reproduction.view_all',
      'reproduction.approve',
      'reproduction.reject',
      'workflow.transition.approve',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'cancel', 'reopen'],
  },

  // ==================== RÔLES RESTAURATION ====================
  {
    role_name: 'Agent Restauration',
    role_level: 'module',
    module: 'restoration',
    description: 'Traite les demandes de restauration',
    permissions: [
      'restoration.view_all',
      'restoration.process',
      'restoration.validate',
      'workflow.transition.validate',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Restauration',
    role_level: 'module',
    module: 'restoration',
    description: 'Supervise la restauration de documents',
    permissions: [
      'restoration.view_all',
      'restoration.approve',
      'restoration.reject',
      'restoration.assign_technician',
      'workflow.transition.approve',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'cancel', 'reopen'],
  },
  {
    role_name: 'Technicien Restauration',
    role_level: 'module',
    module: 'restoration',
    description: 'Effectue la restauration physique des documents',
    permissions: [
      'restoration.view_assigned',
      'restoration.execute',
      'restoration.report',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['complete'],
  },

  // ==================== RÔLES MANUSCRITS ====================
  {
    role_name: 'Gestionnaire Manuscrits',
    role_level: 'module',
    module: 'manuscripts',
    description: 'Gère l\'accès aux manuscrits',
    permissions: [
      'manuscripts.view_all',
      'manuscripts.access_validate',
      'manuscripts.access_reject',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject'],
  },
  {
    role_name: 'Conservateur Manuscrits',
    role_level: 'module',
    module: 'manuscripts',
    description: 'Conserve et protège les manuscrits',
    permissions: [
      'manuscripts.manage',
      'manuscripts.conservation',
      'manuscripts.access_approve',
      'workflow.transition.approve',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'cancel'],
  },
  {
    role_name: 'Catalogueur',
    role_level: 'module',
    module: 'cataloging',
    description: 'Catalogue les documents et manuscrits',
    permissions: [
      'catalog.create',
      'catalog.update',
      'catalog.view_all',
      'workflow.transition.validate',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'complete'],
  },

  // ==================== RÔLES ACTIVITÉS CULTURELLES ====================
  {
    role_name: 'Bureau d\'ordre',
    role_level: 'module',
    module: 'cultural_activities',
    description: 'Réception et transfert des demandes d\'activités culturelles',
    permissions: [
      'cultural.view_all',
      'cultural.receive',
      'cultural.transfer',
      'workflow.transition.assign',
    ],
    can_manage_transitions: true,
    workflow_actions: ['assign', 'validate'],
  },
  {
    role_name: 'Direction',
    role_level: 'admin',
    module: 'cultural_activities',
    description: 'Direction - décision finale sur les activités culturelles',
    permissions: [
      'cultural.view_all',
      'cultural.approve',
      'cultural.reject',
      'workflow.transition.approve',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'reopen'],
  },
  {
    role_name: 'DAC',
    role_level: 'module',
    module: 'cultural_activities',
    description: 'Direction des Activités Culturelles - traitement et clôture',
    permissions: [
      'cultural.view_all',
      'cultural.process',
      'cultural.close',
      'workflow.transition.validate',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'complete'],
  },

  // ==================== RÔLES RÉSERVATION D'ESPACES ====================
  {
    role_name: 'Gestionnaire Espaces',
    role_level: 'module',
    module: 'space_booking',
    description: 'Gère les réservations d\'espaces culturels',
    permissions: [
      'booking.view_all',
      'booking.validate',
      'booking.reject',
      'booking.manage_availability',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject', 'assign'],
  },
  {
    role_name: 'Responsable Espaces Culturels',
    role_level: 'module',
    module: 'space_booking',
    description: 'Supervise les réservations d\'espaces',
    permissions: [
      'booking.view_all',
      'booking.approve',
      'booking.reject',
      'booking.cancel',
      'workflow.transition.approve',
      'workflow.transition.cancel',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'reject', 'cancel', 'reopen'],
  },

  // ==================== RÔLES CBM ====================
  {
    role_name: 'Coordinateur CBM',
    role_level: 'module',
    module: 'cbm',
    description: 'Coordonne le réseau des bibliothèques CBM',
    permissions: [
      'cbm.view_all',
      'cbm.manage_network',
      'cbm.adhesion_validate',
      'workflow.transition.validate',
      'workflow.transition.approve',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'approve', 'reject'],
  },
  {
    role_name: 'Administrateur CBM',
    role_level: 'admin',
    module: 'cbm',
    description: 'Administre la plateforme CBM',
    permissions: [
      'cbm.admin',
      'cbm.manage_all',
      'cbm.catalog_manage',
      'workflow.manage_cbm',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'approve', 'reject', 'cancel', 'reopen'],
  },
  {
    role_name: 'Bibliothèque Partenaire',
    role_level: 'user',
    module: 'cbm',
    description: 'Bibliothèque membre du réseau CBM',
    permissions: [
      'cbm.view_own',
      'cbm.catalog_contribute',
      'cbm.training_request',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Formateur CBM',
    role_level: 'module',
    module: 'cbm',
    description: 'Dispense les formations aux bibliothèques CBM',
    permissions: [
      'cbm.training_manage',
      'cbm.training_deliver',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['complete'],
  },

  // ==================== RÔLES BIBLIOTHÈQUE NUMÉRIQUE ====================
  {
    role_name: 'Gestionnaire Bibliothèque Numérique',
    role_level: 'module',
    module: 'digital_library',
    description: 'Gère le catalogue numérique',
    permissions: [
      'digital_library.manage',
      'digital_library.catalog',
      'digital_library.publish',
      'workflow.transition.validate',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'complete'],
  },
  {
    role_name: 'Agent Numérisation',
    role_level: 'module',
    module: 'ged',
    description: 'Effectue la numérisation des documents',
    permissions: [
      'ged.digitize',
      'ged.archive',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['complete'],
  },
  {
    role_name: 'Contrôleur Qualité',
    role_level: 'module',
    module: 'ged',
    description: 'Contrôle la qualité des numérisations',
    permissions: [
      'ged.quality_control',
      'ged.validate',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject'],
  },
  {
    role_name: 'Archiviste',
    role_level: 'system',
    module: 'ged',
    description: 'Archive et préserve les documents numériques',
    permissions: [
      'ged.archive',
      'ged.preservation',
      'ged.view_all',
      'workflow.transition.complete',
    ],
    can_manage_transitions: true,
    workflow_actions: ['complete'],
  },

  // ==================== RÔLES PORTAIL & CONTENU ====================
  {
    role_name: 'Éditeur Contenu',
    role_level: 'module',
    module: 'portal',
    description: 'Crée et édite le contenu du portail',
    permissions: [
      'portal.create_content',
      'portal.edit_content',
      'workflow.transition.submit',
    ],
    can_manage_transitions: false,
    workflow_actions: ['submit'],
  },
  {
    role_name: 'Modérateur Contenu',
    role_level: 'module',
    module: 'portal',
    description: 'Modère et valide le contenu du portail',
    permissions: [
      'portal.moderate',
      'portal.validate',
      'portal.reject',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
    can_manage_transitions: true,
    workflow_actions: ['validate', 'reject'],
  },
  {
    role_name: 'Administrateur Portail',
    role_level: 'admin',
    module: 'portal',
    description: 'Administre le portail et publie le contenu',
    permissions: [
      'portal.admin',
      'portal.publish',
      'portal.archive',
      'workflow.transition.approve',
    ],
    can_manage_transitions: true,
    workflow_actions: ['approve', 'publish', 'archive'],
  },

  // ==================== RÔLES ANALYTICS ====================
  {
    role_name: 'Analyste',
    role_level: 'module',
    module: 'analytics',
    description: 'Analyse les données et crée des rapports',
    permissions: [
      'analytics.view',
      'analytics.create_reports',
      'analytics.export',
    ],
    can_manage_transitions: false,
    workflow_actions: [],
  },
  {
    role_name: 'Administrateur Reporting',
    role_level: 'system',
    module: 'analytics',
    description: 'Administre le système de reporting',
    permissions: [
      'analytics.admin',
      'analytics.configure',
      'analytics.view_all',
    ],
    can_manage_transitions: false,
    workflow_actions: [],
  },
];

/**
 * Mapper les rôles aux transitions de workflow
 */
export const ROLE_WORKFLOW_TRANSITIONS = {
  // Transitions communes
  submit: ['Inscrit - Étudiant', 'Inscrit - Grand Public', 'Inscrit - Pass Jeunes', 'Adhérent Premium', 'Adhérent Chercheur', 'Déposant - Éditeur', 'Déposant - Imprimeur', 'Déposant - Producteur', 'Déposant - Distributeur', 'Bibliothèque Partenaire', 'Éditeur Contenu'],
  
  validate: ['Agent Inscription', 'Gestionnaire Adhésions', 'Agent Dépôt Légal', 'Agent ISBN/ISSN', 'Agent Reproduction', 'Agent Restauration', 'Gestionnaire Manuscrits', 'Bureau d\'ordre', 'DAC', 'Gestionnaire Espaces', 'Coordinateur CBM', 'Gestionnaire Bibliothèque Numérique', 'Contrôleur Qualité', 'Catalogueur', 'Modérateur Contenu'],
  
  approve: ['Responsable Inscriptions', 'Responsable Adhésions', 'Responsable Dépôt Légal', 'Responsable ISBN/ISSN', 'Responsable Reproduction', 'Responsable Restauration', 'Conservateur Manuscrits', 'Direction', 'Responsable Espaces Culturels', 'Administrateur CBM', 'Administrateur Portail'],
  
  reject: ['Agent Inscription', 'Responsable Inscriptions', 'Gestionnaire Adhésions', 'Responsable Adhésions', 'Agent Dépôt Légal', 'Responsable Dépôt Légal', 'Responsable ISBN/ISSN', 'Agent Reproduction', 'Responsable Reproduction', 'Agent Restauration', 'Responsable Restauration', 'Gestionnaire Manuscrits', 'Conservateur Manuscrits', 'Direction', 'Gestionnaire Espaces', 'Responsable Espaces Culturels', 'Coordinateur CBM', 'Administrateur CBM', 'Contrôleur Qualité', 'Modérateur Contenu'],
  
  assign: ['Bibliothécaire', 'Agent Inscription', 'Agent Dépôt Légal', 'Agent Reproduction', 'Agent Restauration', 'Responsable Restauration', 'Bureau d\'ordre', 'Gestionnaire Espaces'],
  
  complete: ['Archiviste GED', 'Agent ISBN/ISSN', 'Agent Reproduction', 'Technicien Restauration', 'DAC', 'Formateur CBM', 'Gestionnaire Bibliothèque Numérique', 'Agent Numérisation', 'Archiviste', 'Catalogueur'],
  
  cancel: ['Responsable Inscriptions', 'Responsable Adhésions', 'Administrateur BNRM', 'Responsable Dépôt Légal', 'Responsable Reproduction', 'Responsable Restauration', 'Conservateur Manuscrits', 'Responsable Espaces Culturels', 'Administrateur CBM'],
  
  reopen: ['Responsable Inscriptions', 'Responsable Adhésions', 'Responsable Dépôt Légal', 'Responsable ISBN/ISSN', 'Responsable Reproduction', 'Responsable Restauration', 'Direction', 'Responsable Espaces Culturels', 'Administrateur CBM', 'Administrateur Système'],
};
