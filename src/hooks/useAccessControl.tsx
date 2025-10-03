import { useAuth } from "@/hooks/useAuth";
import { canAccessContent, canDownload, canRequestReproduction, hasAdvancedSearch, getAccessMessage, UserRole, AccessLevel } from "@/config/accessPolicies";

/**
 * Hook personnalisé pour gérer les permissions d'accès
 */
export function useAccessControl() {
  const { profile } = useAuth();
  const userRole = (profile?.role as UserRole) || null;

  /**
   * Vérifie si l'utilisateur peut accéder à un contenu
   */
  const checkAccess = (contentAccessLevel: AccessLevel): {
    allowed: boolean;
    message: string;
  } => {
    const allowed = canAccessContent(userRole, contentAccessLevel);
    const message = allowed ? '' : getAccessMessage(userRole, contentAccessLevel);
    
    return { allowed, message };
  };

  /**
   * Vérifie si l'utilisateur peut télécharger
   */
  const checkDownload = (): boolean => {
    return canDownload(userRole);
  };

  /**
   * Vérifie si l'utilisateur peut demander une reproduction
   */
  const checkReproduction = (): boolean => {
    return canRequestReproduction(userRole);
  };

  /**
   * Vérifie si l'utilisateur a accès à la recherche avancée
   */
  const checkAdvancedSearch = (): boolean => {
    return hasAdvancedSearch(userRole);
  };

  return {
    userRole,
    checkAccess,
    checkDownload,
    checkReproduction,
    checkAdvancedSearch,
    isAuthenticated: !!profile,
    isAdmin: userRole === 'admin',
    isLibrarian: userRole === 'librarian' || userRole === 'admin',
    isSubscriber: userRole === 'subscriber' || userRole === 'researcher' || userRole === 'partner',
  };
}
