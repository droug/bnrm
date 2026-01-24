import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
}

export interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  user_id?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Action types for consistency
export const AUDIT_ACTIONS = {
  // Content actions
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
  
  // User actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  ROLE_CHANGE: 'role_change',
  ACCOUNT_LOCK: 'account_lock',
  ACCOUNT_UNLOCK: 'account_unlock',
  
  // Request actions
  APPROVE: 'approve',
  REJECT: 'reject',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  
  // System actions
  EXPORT: 'export',
  IMPORT: 'import',
  BACKUP: 'backup',
  CONFIG_CHANGE: 'config_change',
  CLEANUP: 'cleanup_old_logs',
} as const;

export const RESOURCE_TYPES = {
  USER: 'user',
  CONTENT: 'content',
  NEWS: 'news',
  EVENT: 'event',
  MANUSCRIPT: 'manuscript',
  DOCUMENT: 'document',
  DEPOSIT: 'deposit',
  BOOKING: 'booking',
  ACCESS_REQUEST: 'access_request',
  RESTORATION: 'restoration',
  REPRODUCTION: 'reproduction',
  PROFESSIONAL: 'professional',
  TRANSLATION: 'translation',
  WORKFLOW: 'workflow',
  ROLE: 'role',
  PERMISSION: 'permission',
  TARIFF: 'tariff',
  SYSTEM: 'system',
  BANNER: 'banner',
  FOOTER: 'footer',
  EXHIBITION: 'exhibition',
} as const;

// Hook to fetch audit logs with filters
export function useAuditLogs(filters: AuditLogFilters = {}, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['audit-logs', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select(`
          id,
          user_id,
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch user details for logs that have user_id
      const userIds = [...new Set(data?.filter(l => l.user_id).map(l => l.user_id) || [])];
      let userMap: Record<string, { first_name: string; last_name: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        
        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = { first_name: p.first_name || '', last_name: p.last_name || '' };
            return acc;
          }, {} as Record<string, { first_name: string; last_name: string }>);
        }
      }

      const enrichedLogs: AuditLogEntry[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : null,
        details: log.details as Record<string, any> | null,
        user_name: log.user_id ? `${userMap[log.user_id]?.first_name || ''} ${userMap[log.user_id]?.last_name || ''}`.trim() || undefined : undefined,
      }));

      return {
        logs: enrichedLogs,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
}

// Hook to get distinct values for filters
export function useAuditLogFilterOptions() {
  return useQuery({
    queryKey: ['audit-log-filter-options'],
    queryFn: async () => {
      const [actionsRes, resourceTypesRes] = await Promise.all([
        supabase.from('activity_logs').select('action').limit(100),
        supabase.from('activity_logs').select('resource_type').limit(100),
      ]);

      const actions = [...new Set(actionsRes.data?.map(r => r.action) || [])];
      const resourceTypes = [...new Set(resourceTypesRes.data?.map(r => r.resource_type) || [])];

      return { actions, resourceTypes };
    },
    staleTime: 60000,
  });
}

// Hook to log an action
export function useLogAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      resourceType,
      resourceId,
      details,
    }: {
      action: string;
      resourceType: string;
      resourceId?: string;
      details?: Record<string, any>;
    }) => {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: user?.id || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

// Service function for logging from anywhere in the app
export async function logAuditAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  userId?: string
) {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details || null,
    });

    if (error) {
      console.error('Failed to log audit action:', error);
    }
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}

// Hook for audit statistics
export function useAuditStats(days = 30) {
  return useQuery({
    queryKey: ['audit-stats', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('action, resource_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Aggregate by action
      const byAction = (data || []).reduce((acc: Record<string, number>, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      // Aggregate by resource type
      const byResourceType = (data || []).reduce((acc: Record<string, number>, log) => {
        acc[log.resource_type] = (acc[log.resource_type] || 0) + 1;
        return acc;
      }, {});

      // Aggregate by day
      const byDay = (data || []).reduce((acc: Record<string, number>, log) => {
        const day = log.created_at.split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data?.length || 0,
        byAction: Object.entries(byAction)
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count),
        byResourceType: Object.entries(byResourceType)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        byDay: Object.entries(byDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    },
  });
}
