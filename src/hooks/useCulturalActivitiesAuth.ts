import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// Rôles autorisés pour les activités culturelles
const CULTURAL_ACTIVITIES_ROLES = [
  'Bureau d\'ordre',
  'Direction',
  'DAC',
  'Service Comptabilité',
  'Service Bâtiment'
];

export function useCulturalActivitiesAuth() {
  const { user, profile } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, [user, profile]);

  const checkAuthorization = async () => {
    if (!user) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      // Vérifier si l'utilisateur est admin ou librarian (accès complet)
      if (profile?.role === 'admin' || profile?.role === 'librarian') {
        setIsAuthorized(true);
        setUserRole(profile.role);
        setLoading(false);
        return;
      }

      // Vérifier les rôles workflow spécifiques
      const { data: workflowRoles, error } = await supabase
        .from('workflow_user_roles')
        .select(`
          *,
          workflow_roles!inner (role_name)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('workflow_roles.role_name', CULTURAL_ACTIVITIES_ROLES);

      if (error) throw error;

      if (workflowRoles && workflowRoles.length > 0) {
        setIsAuthorized(true);
        setUserRole(workflowRoles[0].workflow_roles.role_name);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAuthorized, userRole, loading };
}
