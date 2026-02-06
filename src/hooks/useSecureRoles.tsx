import { useUserRoles } from "@/hooks/useUserRoles";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

/**
 * Hook sécurisé pour vérifier les rôles utilisateur
 * Utilise UNIQUEMENT la table user_roles (pas profiles.role)
 * Prévient les attaques d'escalade de privilèges
 */
export function useSecureRoles() {
  const { hasRole, getPrimaryRole, loading, isAdmin } = useUserRoles();

  const isLibrarian = hasRole('librarian') || isAdmin;
  const isValidator = hasRole('validateur');
  const isProfessional = hasRole('editor') || hasRole('printer') || hasRole('producer') || hasRole('distributor');
  const isPartner = hasRole('partner');
  const isResearcher = hasRole('researcher');
  const isSubscriber = hasRole('subscriber');

  /**
   * Vérifie si l'utilisateur a AU MOINS UN des rôles spécifiés
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  /**
   * Vérifie si l'utilisateur a TOUS les rôles spécifiés
   */
  const hasAllRoles = (roles: UserRole[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  return {
    // Vérifications de rôles individuels
    isAdmin,
    isLibrarian,
    isValidator,
    isProfessional,
    isPartner,
    isResearcher,
    isSubscriber,
    
    // Fonctions de vérification
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getPrimaryRole,
    
    // État
    loading,
  };
}
