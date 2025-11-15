/**
 * Configuration complète des modules et services du système BNRM
 * Détectée automatiquement à partir de la structure existante
 */

export interface SystemModule {
  code: string;
  name: string;
  platform: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export interface SystemService {
  code: string;
  name: string;
  module_code: string;
  description: string;
  is_active: boolean;
  requires_approval: boolean;
}

export interface WorkflowPermission {
  permission_name: string;
  category: string;
  description: string;
}

/**
 * Modules système détectés
 */
export const SYSTEM_MODULES: SystemModule[] = [
  // Plateforme BNRM - Services au public
  {
    code: 'INSCRIPTION',
    name: 'Gestion des Inscriptions',
    platform: 'BNRM',
    description: 'Gestion des inscriptions étudiants, grand public et pass jeunes',
    icon: 'UserPlus',
    color: '#3B82F6',
    is_active: true,
  },
  {
    code: 'ADHESION',
    name: 'Gestion des Adhésions',
    platform: 'BNRM',
    description: 'Gestion des adhésions et abonnements aux services BNRM',
    icon: 'BadgeCheck',
    color: '#8B5CF6',
    is_active: true,
  },
  {
    code: 'REPRODUCTION',
    name: 'Demandes de Reproduction',
    platform: 'BNRM',
    description: 'Gestion des demandes de reproduction de documents',
    icon: 'Copy',
    color: '#10B981',
    is_active: true,
  },
  {
    code: 'RESTORATION',
    name: 'Demandes de Restauration',
    platform: 'BNRM',
    description: 'Gestion des demandes de restauration de documents',
    icon: 'Wrench',
    color: '#F59E0B',
    is_active: true,
  },
  {
    code: 'SPACE_BOOKING',
    name: 'Réservation d\'Espaces',
    platform: 'BNRM',
    description: 'Gestion des réservations d\'espaces culturels (auditorium, salles)',
    icon: 'CalendarCheck',
    color: '#EC4899',
    is_active: true,
  },
  {
    code: 'CULTURAL_ACTIVITIES',
    name: 'Activités Culturelles',
    platform: 'BNRM',
    description: 'Gestion des demandes d\'activités culturelles',
    icon: 'Palette',
    color: '#EF4444',
    is_active: true,
  },
  
  // Plateforme Dépôt Légal
  {
    code: 'LEGAL_DEPOSIT',
    name: 'Dépôt Légal',
    platform: 'DEPOT_LEGAL',
    description: 'Gestion des dépôts légaux de publications',
    icon: 'FileCheck',
    color: '#6366F1',
    is_active: true,
  },
  {
    code: 'ISBN_ISSN',
    name: 'Attribution ISBN/ISSN',
    platform: 'DEPOT_LEGAL',
    description: 'Gestion des demandes d\'ISBN et ISSN',
    icon: 'Hash',
    color: '#06B6D4',
    is_active: true,
  },
  
  // Plateforme Manuscrits
  {
    code: 'MANUSCRIPTS',
    name: 'Gestion des Manuscrits',
    platform: 'MANUSCRIPTS',
    description: 'Catalogage et gestion des manuscrits',
    icon: 'ScrollText',
    color: '#A855F7',
    is_active: true,
  },
  {
    code: 'MANUSCRIPTS_ACCESS',
    name: 'Accès aux Manuscrits',
    platform: 'MANUSCRIPTS',
    description: 'Gestion des demandes d\'accès aux manuscrits',
    icon: 'ShieldCheck',
    color: '#7C3AED',
    is_active: true,
  },
  
  // Plateforme Bibliothèque Numérique
  {
    code: 'DIGITAL_LIBRARY',
    name: 'Bibliothèque Numérique',
    platform: 'DIGITAL_LIBRARY',
    description: 'Gestion du catalogue numérique',
    icon: 'Library',
    color: '#14B8A6',
    is_active: true,
  },
  {
    code: 'CATALOGING',
    name: 'Catalogage',
    platform: 'DIGITAL_LIBRARY',
    description: 'Catalogage des documents',
    icon: 'BookMarked',
    color: '#0EA5E9',
    is_active: true,
  },
  {
    code: 'GED',
    name: 'Archivage GED',
    platform: 'DIGITAL_LIBRARY',
    description: 'Gestion électronique des documents et archivage',
    icon: 'Archive',
    color: '#64748B',
    is_active: true,
  },
  
  // Plateforme CBM
  {
    code: 'CBM_NETWORK',
    name: 'Réseau CBM',
    platform: 'CBM',
    description: 'Gestion du réseau des bibliothèques CBM',
    icon: 'Network',
    color: '#22C55E',
    is_active: true,
  },
  {
    code: 'CBM_ADHESION',
    name: 'Adhésions CBM',
    platform: 'CBM',
    description: 'Gestion des adhésions au réseau CBM',
    icon: 'UserPlus',
    color: '#84CC16',
    is_active: true,
  },
  {
    code: 'CBM_TRAINING',
    name: 'Formations CBM',
    platform: 'CBM',
    description: 'Gestion des demandes de formation CBM',
    icon: 'GraduationCap',
    color: '#22D3EE',
    is_active: true,
  },
  {
    code: 'CBM_CATALOG',
    name: 'Catalogue CBM',
    platform: 'CBM',
    description: 'Catalogue mutualisé des bibliothèques CBM',
    icon: 'BookOpen',
    color: '#10B981',
    is_active: true,
  },
  
  // Modules transverses
  {
    code: 'PORTAL',
    name: 'Portail & Contenu',
    platform: 'PORTAL',
    description: 'Gestion du contenu du portail et publications',
    icon: 'Globe',
    color: '#6366F1',
    is_active: true,
  },
  {
    code: 'ANALYTICS',
    name: 'Reporting & Statistiques',
    platform: 'ANALYTICS',
    description: 'Tableaux de bord et statistiques',
    icon: 'BarChart3',
    color: '#F97316',
    is_active: true,
  },
];

/**
 * Services système détectés
 */
export const SYSTEM_SERVICES: SystemService[] = [
  // Services d'inscription
  {
    code: 'INS_STUDENT',
    name: 'Inscription Étudiant/Chercheur',
    module_code: 'INSCRIPTION',
    description: 'Inscription annuelle pour les étudiants et chercheurs',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'INS_PUBLIC',
    name: 'Inscription Grand Public',
    module_code: 'INSCRIPTION',
    description: 'Inscription annuelle pour le grand public',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'INS_YOUTH',
    name: 'Pass Jeunes',
    module_code: 'INSCRIPTION',
    description: 'Abonnement annuel pour les jeunes de 15 à 25 ans',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'INS_DAY_PASS',
    name: 'Pass Journalier',
    module_code: 'INSCRIPTION',
    description: 'Pass donnant accès illimité à la BNRM pour une journée',
    is_active: true,
    requires_approval: false,
  },
  
  // Services d'adhésion
  {
    code: 'ADH_PREMIUM',
    name: 'Adhésion Premium',
    module_code: 'ADHESION',
    description: 'Adhésion avec accès prioritaire et services étendus',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'ADH_RESEARCHER',
    name: 'Adhésion Chercheur',
    module_code: 'ADHESION',
    description: 'Adhésion spécifique pour les chercheurs avec accès aux collections spéciales',
    is_active: true,
    requires_approval: true,
  },
  
  // Services de reproduction
  {
    code: 'REP_PRINT_BW',
    name: 'Impression Noir & Blanc',
    module_code: 'REPRODUCTION',
    description: 'Photocopie/scanner A4, A3 noir & blanc',
    is_active: true,
    requires_approval: false,
  },
  {
    code: 'REP_PRINT_COLOR',
    name: 'Impression Couleur',
    module_code: 'REPRODUCTION',
    description: 'Photocopie/scanner A4, A3 couleur',
    is_active: true,
    requires_approval: false,
  },
  {
    code: 'REP_DIGITAL',
    name: 'Numérisation de Documents',
    module_code: 'REPRODUCTION',
    description: 'Numérisation haute qualité de documents',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'REP_PHOTO',
    name: 'Reproduction Photographique',
    module_code: 'REPRODUCTION',
    description: 'Reproduction photographique de manuscrits et documents rares',
    is_active: true,
    requires_approval: true,
  },
  
  // Services de restauration
  {
    code: 'REST_URGENT',
    name: 'Restauration Urgente',
    module_code: 'RESTORATION',
    description: 'Restauration prioritaire de documents endommagés',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'REST_STANDARD',
    name: 'Restauration Standard',
    module_code: 'RESTORATION',
    description: 'Restauration standard de documents',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'REST_CONSERVATION',
    name: 'Conservation Préventive',
    module_code: 'RESTORATION',
    description: 'Mesures de conservation préventive',
    is_active: true,
    requires_approval: true,
  },
  
  // Services de réservation d'espaces
  {
    code: 'SPACE_AUDITORIUM',
    name: 'Réservation Auditorium',
    module_code: 'SPACE_BOOKING',
    description: 'Location de l\'auditorium par journée/soirée',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'SPACE_CONFERENCE',
    name: 'Réservation Salle de Conférence',
    module_code: 'SPACE_BOOKING',
    description: 'Location de salle de conférence',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'SPACE_WORKSHOP',
    name: 'Réservation Salle d\'Atelier',
    module_code: 'SPACE_BOOKING',
    description: 'Réservation d\'espace pour ateliers et formations',
    is_active: true,
    requires_approval: true,
  },
  
  // Services d'activités culturelles
  {
    code: 'CULT_EXHIBITION',
    name: 'Organisation d\'Exposition',
    module_code: 'CULTURAL_ACTIVITIES',
    description: 'Demande d\'organisation d\'exposition',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'CULT_CONFERENCE',
    name: 'Organisation de Conférence',
    module_code: 'CULTURAL_ACTIVITIES',
    description: 'Demande d\'organisation de conférence',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'CULT_WORKSHOP',
    name: 'Organisation d\'Atelier',
    module_code: 'CULTURAL_ACTIVITIES',
    description: 'Demande d\'organisation d\'atelier culturel',
    is_active: true,
    requires_approval: true,
  },
  
  // Services Dépôt Légal
  {
    code: 'LD_BOOK',
    name: 'Dépôt Légal Livre',
    module_code: 'LEGAL_DEPOSIT',
    description: 'Dépôt légal d\'un livre imprimé',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'LD_PERIODICAL',
    name: 'Dépôt Légal Périodique',
    module_code: 'LEGAL_DEPOSIT',
    description: 'Dépôt légal de périodique ou magazine',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'LD_DIGITAL',
    name: 'Dépôt Légal Numérique',
    module_code: 'LEGAL_DEPOSIT',
    description: 'Dépôt légal de publication numérique',
    is_active: true,
    requires_approval: true,
  },
  
  // Services ISBN/ISSN
  {
    code: 'ISBN_REQUEST',
    name: 'Demande ISBN',
    module_code: 'ISBN_ISSN',
    description: 'Demande d\'attribution d\'ISBN',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'ISSN_REQUEST',
    name: 'Demande ISSN',
    module_code: 'ISBN_ISSN',
    description: 'Demande d\'attribution d\'ISSN',
    is_active: true,
    requires_approval: true,
  },
  
  // Services Manuscrits
  {
    code: 'MAN_ACCESS',
    name: 'Demande d\'Accès Manuscrit',
    module_code: 'MANUSCRIPTS_ACCESS',
    description: 'Demande d\'accès à un manuscrit',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'MAN_CATALOG',
    name: 'Catalogage Manuscrit',
    module_code: 'MANUSCRIPTS',
    description: 'Service de catalogage de manuscrit',
    is_active: true,
    requires_approval: false,
  },
  
  // Services CBM
  {
    code: 'CBM_ADH_NETWORK',
    name: 'Adhésion Réseau CBM',
    module_code: 'CBM_ADHESION',
    description: 'Adhésion d\'une bibliothèque au réseau CBM',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'CBM_ADH_CATALOG',
    name: 'Adhésion Catalogue CBM',
    module_code: 'CBM_ADHESION',
    description: 'Adhésion au catalogue mutualisé CBM',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'CBM_TRAINING',
    name: 'Formation CBM',
    module_code: 'CBM_TRAINING',
    description: 'Demande de formation pour bibliothèques CBM',
    is_active: true,
    requires_approval: true,
  },
  
  // Services Catalogage et GED
  {
    code: 'CAT_DOCUMENT',
    name: 'Catalogage de Document',
    module_code: 'CATALOGING',
    description: 'Service de catalogage de document',
    is_active: true,
    requires_approval: false,
  },
  {
    code: 'GED_ARCHIVE',
    name: 'Archivage Numérique',
    module_code: 'GED',
    description: 'Archivage électronique de document',
    is_active: true,
    requires_approval: false,
  },
];

/**
 * Permissions de workflow détectées
 */
export const WORKFLOW_PERMISSIONS: WorkflowPermission[] = [
  // Permissions de transition de workflow
  {
    permission_name: 'workflow.transition.submit',
    category: 'Transitions Workflow',
    description: 'Soumettre une demande dans un workflow',
  },
  {
    permission_name: 'workflow.transition.validate',
    category: 'Transitions Workflow',
    description: 'Valider une étape de workflow',
  },
  {
    permission_name: 'workflow.transition.reject',
    category: 'Transitions Workflow',
    description: 'Rejeter une demande dans un workflow',
  },
  {
    permission_name: 'workflow.transition.approve',
    category: 'Transitions Workflow',
    description: 'Approuver une demande dans un workflow',
  },
  {
    permission_name: 'workflow.transition.assign',
    category: 'Transitions Workflow',
    description: 'Assigner une demande à un utilisateur',
  },
  {
    permission_name: 'workflow.transition.complete',
    category: 'Transitions Workflow',
    description: 'Marquer une étape comme terminée',
  },
  {
    permission_name: 'workflow.transition.cancel',
    category: 'Transitions Workflow',
    description: 'Annuler une demande dans un workflow',
  },
  {
    permission_name: 'workflow.transition.reopen',
    category: 'Transitions Workflow',
    description: 'Rouvrir une demande clôturée',
  },
  
  // Permissions d'inscription
  {
    permission_name: 'inscription.create',
    category: 'Inscriptions',
    description: 'Créer une nouvelle inscription',
  },
  {
    permission_name: 'inscription.validate',
    category: 'Inscriptions',
    description: 'Valider une inscription',
  },
  {
    permission_name: 'inscription.reject',
    category: 'Inscriptions',
    description: 'Rejeter une inscription',
  },
  {
    permission_name: 'inscription.renew',
    category: 'Inscriptions',
    description: 'Renouveler une inscription',
  },
  {
    permission_name: 'inscription.cancel',
    category: 'Inscriptions',
    description: 'Annuler une inscription',
  },
  {
    permission_name: 'inscription.view_all',
    category: 'Inscriptions',
    description: 'Voir toutes les inscriptions',
  },
  
  // Permissions d'adhésion
  {
    permission_name: 'adhesion.create',
    category: 'Adhésions',
    description: 'Créer une nouvelle adhésion',
  },
  {
    permission_name: 'adhesion.validate',
    category: 'Adhésions',
    description: 'Valider une adhésion',
  },
  {
    permission_name: 'adhesion.reject',
    category: 'Adhésions',
    description: 'Rejeter une adhésion',
  },
  {
    permission_name: 'adhesion.renew',
    category: 'Adhésions',
    description: 'Renouveler une adhésion',
  },
  {
    permission_name: 'adhesion.suspend',
    category: 'Adhésions',
    description: 'Suspendre une adhésion',
  },
  {
    permission_name: 'adhesion.view_all',
    category: 'Adhésions',
    description: 'Voir toutes les adhésions',
  },
  
  // Permissions CBM
  {
    permission_name: 'cbm.adhesion.create',
    category: 'CBM',
    description: 'Créer une demande d\'adhésion CBM',
  },
  {
    permission_name: 'cbm.adhesion.validate',
    category: 'CBM',
    description: 'Valider une adhésion CBM',
  },
  {
    permission_name: 'cbm.training.manage',
    category: 'CBM',
    description: 'Gérer les formations CBM',
  },
  {
    permission_name: 'cbm.catalog.manage',
    category: 'CBM',
    description: 'Gérer le catalogue CBM',
  },
  
  // Permissions générales
  {
    permission_name: 'admin.full_access',
    category: 'Administration',
    description: 'Accès administrateur complet',
  },
  {
    permission_name: 'librarian.manage',
    category: 'Administration',
    description: 'Gérer les fonctions de bibliothécaire',
  },
];

/**
 * Rôles pour les inscriptions et adhésions
 */
export const INSCRIPTION_ADHESION_ROLES = [
  {
    role_name: 'Agent Inscription',
    role_level: 'module',
    module: 'inscription',
    description: 'Gère les demandes d\'inscription des usagers',
    permissions: [
      'inscription.create',
      'inscription.validate',
      'inscription.reject',
      'inscription.renew',
      'inscription.view_all',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
  },
  {
    role_name: 'Gestionnaire Adhésions',
    role_level: 'module',
    module: 'adhesion',
    description: 'Gère les adhésions et abonnements',
    permissions: [
      'adhesion.create',
      'adhesion.validate',
      'adhesion.reject',
      'adhesion.renew',
      'adhesion.suspend',
      'adhesion.view_all',
      'workflow.transition.validate',
      'workflow.transition.reject',
    ],
  },
  {
    role_name: 'Coordinateur CBM Adhésions',
    role_level: 'module',
    module: 'cbm',
    description: 'Coordonne les adhésions des bibliothèques au réseau CBM',
    permissions: [
      'cbm.adhesion.create',
      'cbm.adhesion.validate',
      'cbm.training.manage',
      'workflow.transition.validate',
      'workflow.transition.approve',
    ],
  },
];
