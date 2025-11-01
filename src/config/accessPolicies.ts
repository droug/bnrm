/**
 * Configuration des politiques d'accès aux ressources numériques
 * Selon les directives de la BNRM
 */

export type UserRole = 'visitor' | 'subscriber' | 'researcher' | 'partner' | 'librarian' | 'admin';
export type AccessLevel = 'public' | 'restricted' | 'confidential';
export type ContentType = 'manuscript' | 'book' | 'document' | 'exhibition' | 'news' | 'event';

/**
 * Matrice d'accès : définit quel rôle peut accéder à quel niveau
 */
export const ACCESS_MATRIX: Record<UserRole, AccessLevel[]> = {
  visitor: ['public'],
  subscriber: ['public', 'restricted'],
  researcher: ['public', 'restricted'],
  partner: ['public', 'restricted'],
  librarian: ['public', 'restricted', 'confidential'],
  admin: ['public', 'restricted', 'confidential'],
};

/**
 * Limites par rôle
 */
export const ROLE_LIMITS: Record<UserRole, {
  maxRequests: number;
  maxDownloadsPerDay: number;
  canDownload: boolean;
  canRequestReproduction: boolean;
  priorityProcessing: boolean;
  advancedSearch: boolean;
}> = {
  visitor: {
    maxRequests: 5,
    maxDownloadsPerDay: 0,
    canDownload: false,
    canRequestReproduction: false,
    priorityProcessing: false,
    advancedSearch: false,
  },
  subscriber: {
    maxRequests: 100,
    maxDownloadsPerDay: 10,
    canDownload: true,
    canRequestReproduction: true,
    priorityProcessing: false,
    advancedSearch: true,
  },
  researcher: {
    maxRequests: 50,
    maxDownloadsPerDay: 20,
    canDownload: true,
    canRequestReproduction: true,
    priorityProcessing: false,
    advancedSearch: true,
  },
  partner: {
    maxRequests: 200,
    maxDownloadsPerDay: 50,
    canDownload: true,
    canRequestReproduction: true,
    priorityProcessing: true,
    advancedSearch: true,
  },
  librarian: {
    maxRequests: 999,
    maxDownloadsPerDay: 999,
    canDownload: true,
    canRequestReproduction: true,
    priorityProcessing: true,
    advancedSearch: true,
  },
  admin: {
    maxRequests: 999,
    maxDownloadsPerDay: 999,
    canDownload: true,
    canRequestReproduction: true,
    priorityProcessing: true,
    advancedSearch: true,
  },
};

/**
 * Vérifie si un utilisateur peut accéder à une ressource
 */
export function canAccessContent(
  userRole: UserRole | null,
  contentAccessLevel: AccessLevel
): boolean {
  // Visiteurs non authentifiés peuvent uniquement accéder au contenu public
  if (!userRole) {
    return contentAccessLevel === 'public';
  }

  const allowedLevels = ACCESS_MATRIX[userRole];
  return allowedLevels.includes(contentAccessLevel);
}

/**
 * Vérifie si un utilisateur peut télécharger
 */
export function canDownload(userRole: UserRole | null): boolean {
  if (!userRole) return false;
  return ROLE_LIMITS[userRole].canDownload;
}

/**
 * Vérifie si un utilisateur peut demander une reproduction
 */
export function canRequestReproduction(userRole: UserRole | null): boolean {
  if (!userRole) return false;
  return ROLE_LIMITS[userRole].canRequestReproduction;
}

/**
 * Obtient le nombre maximum de demandes autorisées
 */
export function getMaxRequests(userRole: UserRole | null): number {
  if (!userRole) return ROLE_LIMITS.visitor.maxRequests;
  return ROLE_LIMITS[userRole].maxRequests;
}

/**
 * Vérifie si un utilisateur a accès à la recherche avancée
 */
export function hasAdvancedSearch(userRole: UserRole | null): boolean {
  if (!userRole) return false;
  return ROLE_LIMITS[userRole].advancedSearch;
}

/**
 * Obtient un message d'information sur les restrictions d'accès
 */
export function getAccessMessage(
  userRole: UserRole | null,
  contentAccessLevel: AccessLevel
): string {
  if (canAccessContent(userRole, contentAccessLevel)) {
    return '';
  }

  if (!userRole) {
    return 'Ce contenu est réservé aux membres. Veuillez vous connecter ou créer un compte pour y accéder.';
  }

  if (contentAccessLevel === 'restricted') {
    return 'Ce contenu est réservé aux adhérents de la BNRM.';
  }

  if (contentAccessLevel === 'confidential') {
    return 'Ce contenu est confidentiel et réservé au personnel autorisé.';
  }

  return 'Vous n\'avez pas les permissions nécessaires pour accéder à ce contenu.';
}

/**
 * Obtient la description du niveau d'accès
 */
export function getAccessLevelDescription(level: AccessLevel): string {
  const descriptions: Record<AccessLevel, string> = {
    public: 'Accessible à tous les visiteurs',
    restricted: 'Réservé aux adhérents et chercheurs',
    confidential: 'Accès administrateur uniquement',
  };
  return descriptions[level];
}

/**
 * Obtient la description du rôle utilisateur
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    visitor: 'Visiteur - Accès limité au contenu public',
    subscriber: 'Adhérent - Accès étendu aux collections',
    researcher: 'Chercheur - Accès académique aux ressources',
    partner: 'Partenaire - Accès privilégié institutionnel',
    librarian: 'Bibliothécaire - Gestion et accès complet',
    admin: 'Administrateur - Accès et contrôle total',
  };
  return descriptions[role];
}

/**
 * Vérifie si un utilisateur peut demander la reproduction d'un type de contenu
 * Les détenteurs de pass journalier peuvent reproduire sauf les manuscrits et collections spécialisées
 */
export function canReproduceContentType(
  userRole: UserRole | null,
  contentType: ContentType | string
): { allowed: boolean; message: string } {
  // Visiteurs non authentifiés ne peuvent pas faire de reproductions
  if (!userRole) {
    return {
      allowed: false,
      message: 'Veuillez vous connecter pour demander une reproduction.',
    };
  }

  // Les détenteurs de pass journalier ont des restrictions
  if (userRole === 'visitor') {
    const restrictedTypes = ['manuscript', 'collection_specialisee'];
    
    if (restrictedTypes.some(type => contentType.toLowerCase().includes(type) || contentType === type)) {
      return {
        allowed: false,
        message: 'La reproduction des manuscrits et collections spécialisées nécessite un abonnement. Les détenteurs de pass journalier peuvent reproduire les autres documents.',
      };
    }
  }

  // Tous les autres rôles peuvent reproduire tous les types de contenu
  return {
    allowed: true,
    message: '',
  };
}
