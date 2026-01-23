import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Error404Log {
  path: string;
  referrer: string | null;
  user_agent: string;
  timestamp: string;
  user_id?: string;
}

/**
 * Hook to track 404 errors with referrer information
 * Logs to the database for SEO analysis and broken link detection
 */
export function use404Tracking() {
  const location = useLocation();

  const track404Error = useCallback(async (path: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const errorLog: Error404Log = {
        path,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        user_id: session?.session?.user?.id,
      };

      // Log to activity_logs table
      await supabase.from('activity_logs').insert({
        action: '404_error',
        resource_type: 'page',
        resource_id: path,
        user_id: session?.session?.user?.id || null,
        details: {
          referrer: errorLog.referrer,
          user_agent: errorLog.user_agent,
          path: path,
        },
      });

      // Also log to console for debugging
      console.warn('[404 Tracking]', {
        path,
        referrer: errorLog.referrer,
        timestamp: errorLog.timestamp,
      });
    } catch (error) {
      console.error('Failed to track 404 error:', error);
    }
  }, []);

  return { track404Error };
}

/**
 * Hook for use in NotFound page components
 */
export function useNotFoundTracking() {
  const location = useLocation();
  const { track404Error } = use404Tracking();

  useEffect(() => {
    track404Error(location.pathname + location.search);
  }, [location.pathname, location.search, track404Error]);
}

/**
 * Fetch 404 error statistics for admin dashboard
 */
export async function fetch404Stats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('action', '404_error')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch 404 stats:', error);
    return [];
  }

  // Group by path for analysis
  const pathStats = data.reduce((acc: Record<string, any>, log: any) => {
    const path = log.resource_id;
    if (!acc[path]) {
      acc[path] = {
        path,
        count: 0,
        referrers: new Set<string>(),
        lastOccurrence: log.created_at,
      };
    }
    acc[path].count++;
    if (log.details?.referrer) {
      acc[path].referrers.add(log.details.referrer);
    }
    return acc;
  }, {});

  return Object.values(pathStats).map((stat: any) => ({
    ...stat,
    referrers: Array.from(stat.referrers),
  }));
}
