import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Permission {
  granted: boolean;
  category: string;
  expires_at?: string;
}

interface PermissionsContextType {
  permissions: Record<string, Permission> | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  refetchPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, Permission> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', { user_uuid: user.id });

      if (error) {
        console.error('Error fetching permissions:', error);
        setPermissions({});
      } else {
        setPermissions((data as unknown as Record<string, Permission>) || {});
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    return permissions[permission]?.granted || false;
  };

  const refetchPermissions = async () => {
    setLoading(true);
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{
      permissions,
      loading,
      hasPermission,
      refetchPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Permission guard component
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <div className="animate-pulse h-4 bg-muted rounded w-20"></div>;
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}