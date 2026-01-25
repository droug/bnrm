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
  
  // Plateforme Kitab
  {
    code: 'KITAB_DEPOSIT',
    name: 'Dépôt Kitab',
    platform: 'KITAB',
    description: 'Gestion des dépôts de publications Kitab',
    icon: 'BookPlus',
    color: '#E11D48',
    is_active: true,
  },
  {
    code: 'KITAB_ISBN',
    name: 'ISBN Kitab',
    platform: 'KITAB',
    description: 'Attribution et gestion des ISBN via Kitab',
    icon: 'Hash',
    color: '#BE185D',
    is_active: true,
  },
  {
    code: 'KITAB_PUBLISHERS',
    name: 'Éditeurs Kitab',
    platform: 'KITAB',
    description: 'Gestion des éditeurs enregistrés sur Kitab',
    icon: 'Users',
    color: '#DB2777',
    is_active: true,
  },
  {
    code: 'KITAB_STATISTICS',
    name: 'Statistiques Kitab',
    platform: 'KITAB',
    description: 'Statistiques et rapports du secteur de l\'édition',
    icon: 'BarChart',
    color: '#EC4899',
    is_active: true,
  },
  
  // Plateforme VExpo360
  {
    code: 'VEXPO_EXHIBITIONS',
    name: 'Expositions Virtuelles',
    platform: 'VEXPO360',
    description: 'Création et gestion des expositions virtuelles 360°',
    icon: 'Box',
    color: '#7C3AED',
    is_active: true,
  },
  {
    code: 'VEXPO_GALLERIES',
    name: 'Galeries VExpo',
    platform: 'VEXPO360',
    description: 'Gestion des galeries et espaces d\'exposition',
    icon: 'Images',
    color: '#8B5CF6',
    is_active: true,
  },
  {
    code: 'VEXPO_MEDIA',
    name: 'Médias VExpo',
    platform: 'VEXPO360',
    description: 'Gestion des médias (images, vidéos, audio) des expositions',
    icon: 'Video',
    color: '#A855F7',
    is_active: true,
  },
  
  // Plateforme CBN (Catalogue Bibliothèque Nationale)
  {
    code: 'CBN_CATALOG',
    name: 'Catalogue CBN',
    platform: 'CBN',
    description: 'Catalogue général de la Bibliothèque Nationale',
    icon: 'Database',
    color: '#0891B2',
    is_active: true,
  },
  {
    code: 'CBN_ACQUISITIONS',
    name: 'Acquisitions CBN',
    platform: 'CBN',
    description: 'Gestion des acquisitions et enrichissement du fonds',
    icon: 'ShoppingCart',
    color: '#06B6D4',
    is_active: true,
  },
  {
    code: 'CBN_PERIODICALS',
    name: 'Périodiques CBN',
    platform: 'CBN',
    description: 'Gestion des périodiques et abonnements',
    icon: 'Newspaper',
    color: '#14B8A6',
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
  {
    code: 'NOTIFICATIONS',
    name: 'Notifications',
    platform: 'SYSTEM',
    description: 'Système de notifications et alertes',
    icon: 'Bell',
    color: '#EAB308',
    is_active: true,
  },
  {
    code: 'AUDIT',
    name: 'Audit & Traçabilité',
    platform: 'SYSTEM',
    description: 'Journalisation et traçabilité des actions',
    icon: 'ClipboardList',
    color: '#64748B',
    is_active: true,
  },
  {
    code: 'SECURITY',
    name: 'Sécurité',
    platform: 'SYSTEM',
    description: 'Gestion de la sécurité et des accès',
    icon: 'ShieldCheck',
    color: '#DC2626',
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
  
  // Services Kitab
  {
    code: 'KITAB_ISBN_REQUEST',
    name: 'Demande ISBN Kitab',
    module_code: 'KITAB_ISBN',
    description: 'Demande d\'attribution ISBN via plateforme Kitab',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'KITAB_PUBLISHER_REG',
    name: 'Inscription Éditeur Kitab',
    module_code: 'KITAB_PUBLISHERS',
    description: 'Inscription d\'un éditeur sur la plateforme Kitab',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'KITAB_DEPOSIT_BOOK',
    name: 'Dépôt Livre Kitab',
    module_code: 'KITAB_DEPOSIT',
    description: 'Dépôt d\'un livre via plateforme Kitab',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'KITAB_STATS_REPORT',
    name: 'Rapport Statistiques Kitab',
    module_code: 'KITAB_STATISTICS',
    description: 'Génération de rapports statistiques secteur édition',
    is_active: true,
    requires_approval: false,
  },
  
  // Services VExpo360
  {
    code: 'VEXPO_CREATE',
    name: 'Création Exposition',
    module_code: 'VEXPO_EXHIBITIONS',
    description: 'Création d\'une nouvelle exposition virtuelle',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'VEXPO_PUBLISH',
    name: 'Publication Exposition',
    module_code: 'VEXPO_EXHIBITIONS',
    description: 'Publication d\'une exposition virtuelle',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'VEXPO_GALLERY_CREATE',
    name: 'Création Galerie',
    module_code: 'VEXPO_GALLERIES',
    description: 'Création d\'une galerie d\'exposition',
    is_active: true,
    requires_approval: false,
  },
  {
    code: 'VEXPO_MEDIA_UPLOAD',
    name: 'Téléversement Média',
    module_code: 'VEXPO_MEDIA',
    description: 'Téléversement de médias pour expositions',
    is_active: true,
    requires_approval: false,
  },
  
  // Services CBN
  {
    code: 'CBN_NOTICE_CREATE',
    name: 'Création Notice CBN',
    module_code: 'CBN_CATALOG',
    description: 'Création d\'une notice bibliographique CBN',
    is_active: true,
    requires_approval: false,
  },
  {
    code: 'CBN_ACQUISITION',
    name: 'Proposition Acquisition',
    module_code: 'CBN_ACQUISITIONS',
    description: 'Proposition d\'acquisition de document',
    is_active: true,
    requires_approval: true,
  },
  {
    code: 'CBN_PERIODICAL_SUB',
    name: 'Abonnement Périodique',
    module_code: 'CBN_PERIODICALS',
    description: 'Gestion d\'abonnement à un périodique',
    is_active: true,
    requires_approval: true,
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
  
  // Permissions Kitab
  {
    permission_name: 'kitab.deposit.create',
    category: 'Kitab',
    description: 'Créer un dépôt sur Kitab',
  },
  {
    permission_name: 'kitab.deposit.validate',
    category: 'Kitab',
    description: 'Valider un dépôt Kitab',
  },
  {
    permission_name: 'kitab.isbn.request',
    category: 'Kitab',
    description: 'Demander un ISBN via Kitab',
  },
  {
    permission_name: 'kitab.isbn.assign',
    category: 'Kitab',
    description: 'Attribuer un ISBN',
  },
  {
    permission_name: 'kitab.publisher.register',
    category: 'Kitab',
    description: 'Enregistrer un éditeur sur Kitab',
  },
  {
    permission_name: 'kitab.publisher.manage',
    category: 'Kitab',
    description: 'Gérer les éditeurs Kitab',
  },
  {
    permission_name: 'kitab.statistics.view',
    category: 'Kitab',
    description: 'Consulter les statistiques Kitab',
  },
  {
    permission_name: 'kitab.statistics.export',
    category: 'Kitab',
    description: 'Exporter les statistiques Kitab',
  },
  
  // Permissions VExpo360
  {
    permission_name: 'vexpo.exhibition.create',
    category: 'VExpo360',
    description: 'Créer une exposition virtuelle',
  },
  {
    permission_name: 'vexpo.exhibition.edit',
    category: 'VExpo360',
    description: 'Modifier une exposition virtuelle',
  },
  {
    permission_name: 'vexpo.exhibition.publish',
    category: 'VExpo360',
    description: 'Publier une exposition virtuelle',
  },
  {
    permission_name: 'vexpo.exhibition.delete',
    category: 'VExpo360',
    description: 'Supprimer une exposition virtuelle',
  },
  {
    permission_name: 'vexpo.gallery.manage',
    category: 'VExpo360',
    description: 'Gérer les galeries VExpo',
  },
  {
    permission_name: 'vexpo.media.upload',
    category: 'VExpo360',
    description: 'Téléverser des médias VExpo',
  },
  {
    permission_name: 'vexpo.roles.manage',
    category: 'VExpo360',
    description: 'Gérer les rôles VExpo (super_admin, editor, reviewer)',
  },
  
  // Permissions CBN
  {
    permission_name: 'cbn.catalog.view',
    category: 'CBN',
    description: 'Consulter le catalogue CBN',
  },
  {
    permission_name: 'cbn.catalog.create',
    category: 'CBN',
    description: 'Créer une notice CBN',
  },
  {
    permission_name: 'cbn.catalog.edit',
    category: 'CBN',
    description: 'Modifier une notice CBN',
  },
  {
    permission_name: 'cbn.catalog.validate',
    category: 'CBN',
    description: 'Valider une notice CBN',
  },
  {
    permission_name: 'cbn.acquisition.propose',
    category: 'CBN',
    description: 'Proposer une acquisition',
  },
  {
    permission_name: 'cbn.acquisition.approve',
    category: 'CBN',
    description: 'Approuver une acquisition',
  },
  {
    permission_name: 'cbn.periodical.manage',
    category: 'CBN',
    description: 'Gérer les périodiques et abonnements',
  },
  
  // Permissions Manuscrits étendues
  {
    permission_name: 'manuscripts.view',
    category: 'Manuscrits',
    description: 'Consulter les manuscrits',
  },
  {
    permission_name: 'manuscripts.create',
    category: 'Manuscrits',
    description: 'Créer une fiche manuscrit',
  },
  {
    permission_name: 'manuscripts.edit',
    category: 'Manuscrits',
    description: 'Modifier une fiche manuscrit',
  },
  {
    permission_name: 'manuscripts.digitize',
    category: 'Manuscrits',
    description: 'Gérer la numérisation des manuscrits',
  },
  {
    permission_name: 'manuscripts.access.request',
    category: 'Manuscrits',
    description: 'Demander l\'accès à un manuscrit',
  },
  {
    permission_name: 'manuscripts.access.approve',
    category: 'Manuscrits',
    description: 'Approuver une demande d\'accès',
  },
  {
    permission_name: 'manuscripts.conservation.view',
    category: 'Manuscrits',
    description: 'Consulter l\'état de conservation',
  },
  {
    permission_name: 'manuscripts.conservation.update',
    category: 'Manuscrits',
    description: 'Mettre à jour l\'état de conservation',
  },
  
  // Permissions Dépôt Légal étendues
  {
    permission_name: 'legal_deposit.create',
    category: 'Dépôt Légal',
    description: 'Créer un dépôt légal',
  },
  {
    permission_name: 'legal_deposit.validate',
    category: 'Dépôt Légal',
    description: 'Valider un dépôt légal',
  },
  {
    permission_name: 'legal_deposit.reject',
    category: 'Dépôt Légal',
    description: 'Rejeter un dépôt légal',
  },
  {
    permission_name: 'legal_deposit.assign_number',
    category: 'Dépôt Légal',
    description: 'Attribuer un numéro de dépôt',
  },
  {
    permission_name: 'legal_deposit.archive',
    category: 'Dépôt Légal',
    description: 'Archiver un dépôt légal',
  },
  
  // Permissions Bibliothèque Numérique
  {
    permission_name: 'digital_library.view',
    category: 'Bibliothèque Numérique',
    description: 'Consulter la bibliothèque numérique',
  },
  {
    permission_name: 'digital_library.upload',
    category: 'Bibliothèque Numérique',
    description: 'Téléverser des documents',
  },
  {
    permission_name: 'digital_library.catalog',
    category: 'Bibliothèque Numérique',
    description: 'Cataloguer des documents',
  },
  {
    permission_name: 'digital_library.publish',
    category: 'Bibliothèque Numérique',
    description: 'Publier des documents',
  },
  {
    permission_name: 'digital_library.manage_access',
    category: 'Bibliothèque Numérique',
    description: 'Gérer les droits d\'accès',
  },
  
  // Permissions Espaces & Réservations
  {
    permission_name: 'spaces.view',
    category: 'Espaces Culturels',
    description: 'Consulter les espaces disponibles',
  },
  {
    permission_name: 'spaces.book',
    category: 'Espaces Culturels',
    description: 'Réserver un espace',
  },
  {
    permission_name: 'spaces.manage',
    category: 'Espaces Culturels',
    description: 'Gérer les espaces culturels',
  },
  {
    permission_name: 'booking.view',
    category: 'Espaces Culturels',
    description: 'Consulter les réservations',
  },
  {
    permission_name: 'booking.approve',
    category: 'Espaces Culturels',
    description: 'Approuver les réservations',
  },
  {
    permission_name: 'booking.reject',
    category: 'Espaces Culturels',
    description: 'Rejeter les réservations',
  },
  
  // Permissions Activités Culturelles
  {
    permission_name: 'cultural.event.create',
    category: 'Activités Culturelles',
    description: 'Créer un événement culturel',
  },
  {
    permission_name: 'cultural.event.edit',
    category: 'Activités Culturelles',
    description: 'Modifier un événement culturel',
  },
  {
    permission_name: 'cultural.event.publish',
    category: 'Activités Culturelles',
    description: 'Publier un événement culturel',
  },
  {
    permission_name: 'cultural.event.cancel',
    category: 'Activités Culturelles',
    description: 'Annuler un événement culturel',
  },
  
  // Permissions Système
  {
    permission_name: 'system.audit.view',
    category: 'Système',
    description: 'Consulter les logs d\'audit',
  },
  {
    permission_name: 'system.audit.export',
    category: 'Système',
    description: 'Exporter les logs d\'audit',
  },
  {
    permission_name: 'system.notifications.manage',
    category: 'Système',
    description: 'Gérer les notifications système',
  },
  {
    permission_name: 'system.security.manage',
    category: 'Système',
    description: 'Gérer les paramètres de sécurité',
  },
  {
    permission_name: 'system.users.manage',
    category: 'Système',
    description: 'Gérer les utilisateurs',
  },
  {
    permission_name: 'system.roles.manage',
    category: 'Système',
    description: 'Gérer les rôles et permissions',
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
// Importer depuis le fichier complet
export { COMPLETE_SYSTEM_ROLES as INSCRIPTION_ADHESION_ROLES } from './completeSystemRoles';
