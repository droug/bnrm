import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { canAccessContent, canDownload, canRequestReproduction, hasAdvancedSearch, getAccessMessage, canReproduceContentType, UserRole, AccessLevel, ContentType } from "@/config/accessPolicies";

/**
 * Hook personnalisé pour gérer les permissions d'accès
 * Utilise la table user_roles pour plus de sécurité (évite l'escalade de privilèges)
 */
export function useAccessControl() {
  const { user } = useAuth();
  const { getPrimaryRole, hasRole, loading } = useUserRoles();
  const userRole = (getPrimaryRole() as UserRole) || 'visitor';

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

  /**
   * Vérifie si l'utilisateur peut reproduire un type de contenu spécifique
   */
  const checkReproductionByContentType = (contentType: ContentType | string): {
    allowed: boolean;
    message: string;
  } => {
    return canReproduceContentType(userRole, contentType);
  };

  return {
    userRole,
    checkAccess,
    checkDownload,
    checkReproduction,
    checkAdvancedSearch,
    checkReproductionByContentType,
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    isLibrarian: hasRole('librarian') || hasRole('admin'),
    isSubscriber: hasRole('subscriber') || hasRole('researcher') || hasRole('partner'),
    loading,
  };
}
