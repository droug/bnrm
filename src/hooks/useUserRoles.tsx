import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];
type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];

interface RoleInfo {
  id: string;
  role: UserRole;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

/**
 * Hook pour gérer les rôles utilisateur de manière sécurisée
 * Les rôles sont stockés dans une table séparée (user_roles) pour éviter l'escalade de privilèges
 */
export function useUserRoles(targetUserId?: string) {
  const { user, profile } = useAuth();
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = targetUserId || user?.id;
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    fetchRoles();
  }, [userId]);

  const fetchRoles = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error("Erreur", {
        description: "Impossible de charger les rôles utilisateur",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Attribuer un nouveau rôle (admin uniquement)
   */
  const grantRole = async (role: UserRole, expiresAt?: string) => {
    if (!isAdmin) {
      toast.error("Permission refusée", {
        description: "Seuls les administrateurs peuvent attribuer des rôles",
      });
      return false;
    }

    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          granted_by: user?.id,
          expires_at: expiresAt || null,
        });

      if (error) throw error;

      toast.success("Rôle attribué", {
        description: `Le rôle ${role} a été attribué avec succès`,
      });
      
      await fetchRoles();
      return true;
    } catch (error: any) {
      console.error('Error granting role:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible d'attribuer le rôle",
      });
      return false;
    }
  };

  /**
   * Révoquer un rôle (admin uniquement)
   */
  const revokeRole = async (roleId: string) => {
    if (!isAdmin) {
      toast.error("Permission refusée", {
        description: "Seuls les administrateurs peuvent révoquer des rôles",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success("Rôle révoqué", {
        description: "Le rôle a été révoqué avec succès",
      });
      
      await fetchRoles();
      return true;
    } catch (error: any) {
      console.error('Error revoking role:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de révoquer le rôle",
      });
      return false;
    }
  };

  /**
   * Vérifier si l'utilisateur possède un rôle spécifique
   */
  const hasRole = (role: UserRole): boolean => {
    return roles.some(r => 
      r.role === role && 
      (!r.expires_at || new Date(r.expires_at) > new Date())
    );
  };

  /**
   * Obtenir le rôle principal (avec la plus haute priorité)
   */
  const getPrimaryRole = (): UserRole => {
    const rolePriority: Partial<Record<UserRole, number>> = {
      admin: 1,
      librarian: 2,
      partner: 3,
      researcher: 4,
      subscriber: 5,
      visitor: 6,
      public_user: 7,
    };

    const activeRoles = roles.filter(r => 
      !r.expires_at || new Date(r.expires_at) > new Date()
    );

    if (activeRoles.length === 0) return 'visitor';

    return activeRoles.reduce((highest, current) => {
      const currentPriority = rolePriority[current.role] ?? 999;
      const highestPriority = rolePriority[highest] ?? 999;
      return currentPriority < highestPriority ? current.role : highest;
    }, activeRoles[0].role);
  };

  return {
    roles,
    loading,
    grantRole,
    revokeRole,
    hasRole,
    getPrimaryRole,
    refetch: fetchRoles,
    isAdmin,
  };
}
