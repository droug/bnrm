import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type SystemRoleRow = Database['public']['Tables']['system_roles']['Row'];
type UserSystemRoleRow = Database['public']['Tables']['user_system_roles']['Row'];

interface UserSystemRole {
  role_id: string;
  role_code: string;
  role_name: string;
  role_category: string;
  granted_at: string;
  expires_at: string | null;
}

/**
 * Hook pour gérer les rôles système dynamiques
 * Utilise les tables system_roles et user_system_roles
 * Admin reste dans user_roles (enum)
 */
export function useSystemRoles(targetUserId?: string) {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserSystemRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<SystemRoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = targetUserId || user?.id;
  
  // Vérifier si l'utilisateur est admin (reste dans user_roles)
  const [isAdmin, setIsAdmin] = useState(false);

  // Toujours charger les rôles disponibles (indépendamment de l'utilisateur)
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  // Charger les rôles de l'utilisateur seulement si userId existe
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    fetchRoles();
  }, [userId]);

  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  /**
   * Récupérer tous les rôles de l'utilisateur
   */
  const fetchRoles = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Utiliser la fonction RPC get_user_all_system_roles
      const { data, error } = await supabase
        .rpc('get_user_all_system_roles', { _user_id: userId });

      if (error) throw error;
      
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      toast.error("Erreur", {
        description: "Impossible de charger les rôles utilisateur",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupérer tous les rôles disponibles
   */
  const fetchAvailableRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('system_roles')
        .select('*')
        .eq('is_active', true)
        .order('role_category', { ascending: true })
        .order('role_name', { ascending: true });

      if (error) throw error;
      setAvailableRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching available roles:', error);
    }
  };

  /**
   * Attribuer un rôle système (admin uniquement)
   */
  const grantRole = async (roleCode: string, expiresAt?: string) => {
    if (!isAdmin) {
      toast.error("Permission refusée", {
        description: "Seuls les administrateurs peuvent attribuer des rôles",
      });
      return false;
    }

    if (!userId) return false;

    try {
      // Trouver le role_id depuis le role_code
      const role = availableRoles.find(r => r.role_code === roleCode);
      if (!role) {
        throw new Error(`Rôle introuvable: ${roleCode}`);
      }

      const { error } = await supabase
        .from('user_system_roles')
        .insert({
          user_id: userId,
          role_id: role.id,
          granted_by: user?.id,
          expires_at: expiresAt || null,
        });

      if (error) throw error;

      toast.success("Rôle attribué", {
        description: `Le rôle ${role.role_name} a été attribué avec succès`,
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
   * Révoquer un rôle système (admin uniquement)
   */
  const revokeRole = async (userRoleId: string) => {
    if (!isAdmin) {
      toast.error("Permission refusée", {
        description: "Seuls les administrateurs peuvent révoquer des rôles",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_system_roles')
        .delete()
        .eq('id', userRoleId);

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
  const hasRole = (roleCode: string): boolean => {
    if (roleCode === 'admin') return isAdmin;
    return userRoles.some(r => r.role_code === roleCode);
  };

  /**
   * Obtenir le rôle principal (avec la plus haute priorité)
   */
  const getPrimaryRole = (): string => {
    if (isAdmin) return 'admin';
    if (userRoles.length === 0) return 'visitor';
    
    // Les rôles sont déjà triés par priorité dans la RPC
    return userRoles[0].role_code;
  };

  /**
   * Obtenir les détails d'un rôle
   */
  const getRoleDetails = (roleCode: string): SystemRoleRow | undefined => {
    return availableRoles.find(r => r.role_code === roleCode);
  };

  return {
    userRoles,
    availableRoles,
    loading,
    grantRole,
    revokeRole,
    hasRole,
    getPrimaryRole,
    getRoleDetails,
    refetch: fetchRoles,
    isAdmin,
  };
}
