import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const gaMeasurementId = Deno.env.get('GA_MEASUREMENT_ID');
const matomoUrl = Deno.env.get('MATOMO_URL');
const matomoSiteId = Deno.env.get('MATOMO_SITE_ID');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AnalyticsEvent {
  event_type: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  event_value?: number;
  page_path: string;
  page_title?: string;
  user_id?: string;
  session_id?: string;
  platform: string;
  device_type?: string;
  browser?: string;
  country?: string;
  language?: string;
  referrer?: string;
  custom_dimensions?: Record<string, any>;
}

/**
 * Get analytics configuration for frontend
 */
function getConfig() {
  return {
    ga4: {
      measurementId: gaMeasurementId || '',
      enabled: !!gaMeasurementId && gaMeasurementId !== 'GA_MEASUREMENT_ID',
    },
    matomo: {
      url: matomoUrl || '',
      siteId: matomoSiteId || '',
      enabled: !!(matomoUrl && matomoSiteId),
    },
  };
}

/**
 * Store analytics event in database
 */
async function storeEvent(event: AnalyticsEvent) {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      event_type: event.event_type || 'page_view',
      event_category: event.event_category,
      event_action: event.event_action,
      event_label: event.event_label,
      event_value: event.event_value,
      page_path: event.page_path,
      page_title: event.page_title,
      user_id: event.user_id,
      session_id: event.session_id,
      platform: event.platform || 'portail',
      device_type: event.device_type,
      browser: event.browser,
      country: event.country,
      language: event.language,
      referrer: event.referrer,
      custom_dimensions: event.custom_dimensions || {},
    });

  if (error) {
    console.error('Error storing analytics event:', error);
    throw error;
  }
}

/**
 * Get aggregated statistics
 */
async function getStatistics(params: {
  startDate: string;
  endDate: string;
  platform?: string;
}) {
  const { startDate, endDate, platform } = params;

  let query = supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('event_type', 'page_view');

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data: events, error } = await query;

  if (error) throw error;

  // Aggregate data
  const pageViews = events?.length || 0;
  const uniqueUsers = new Set(events?.map(e => e.user_id || e.session_id)).size;
  
  const platforms = events?.reduce((acc: Record<string, number>, e) => {
    acc[e.platform] = (acc[e.platform] || 0) + 1;
    return acc;
  }, {}) || {};

  // Top pages
  const topPages = events?.reduce((acc: Record<string, number>, e) => {
    acc[e.page_path] = (acc[e.page_path] || 0) + 1;
    return acc;
  }, {}) || {};

  const sortedPages = Object.entries(topPages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }));

  // Daily breakdown
  const dailyData = events?.reduce((acc: Record<string, number>, e) => {
    const date = e.created_at.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) || {};

  return {
    summary: {
      totalPageViews: pageViews,
      uniqueVisitors: uniqueUsers,
      avgPagesPerVisitor: uniqueUsers > 0 ? parseFloat((pageViews / uniqueUsers).toFixed(2)) : 0,
    },
    platforms,
    topPages: sortedPages,
    dailyPageViews: Object.entries(dailyData)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Get content performance metrics
 */
async function getContentMetrics(params: {
  startDate: string;
  endDate: string;
  contentType?: string;
}) {
  const { startDate, endDate, contentType } = params;

  let query = supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('event_category', 'Content');

  const { data: events, error } = await query;

  if (error) throw error;

  // Aggregate by content
  const contentViews = events?.reduce((acc: Record<string, any>, e) => {
    const contentId = e.custom_dimensions?.content_id || 'unknown';
    const contentTitle = e.custom_dimensions?.content_title || 'Unknown';
    const type = e.custom_dimensions?.content_type || 'unknown';
    
    if (contentType && type !== contentType) return acc;
    
    if (!acc[contentId]) {
      acc[contentId] = { id: contentId, title: contentTitle, type, views: 0 };
    }
    acc[contentId].views++;
    return acc;
  }, {}) || {};

  const sortedContent = Object.values(contentViews)
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 20);

  return {
    topContent: sortedContent,
    totalContentViews: events?.length || 0,
    byType: events?.reduce((acc: Record<string, number>, e) => {
      const type = e.custom_dimensions?.content_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {},
  };
}

/**
 * Get search analytics
 */
async function getSearchMetrics(params: {
  startDate: string;
  endDate: string;
  platform?: string;
}) {
  const { startDate, endDate, platform } = params;

  let query = supabase
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('event_action', 'search');

  if (platform) {
    query = query.eq('platform', platform);
  }

  const { data: events, error } = await query;

  if (error) throw error;

  // Top search queries
  const searchQueries = events?.reduce((acc: Record<string, any>, e) => {
    const queryText = e.event_label || 'unknown';
    if (!acc[queryText]) {
      acc[queryText] = { query: queryText, count: 0, avgResults: 0, totalResults: 0 };
    }
    acc[queryText].count++;
    acc[queryText].totalResults += e.event_value || 0;
    acc[queryText].avgResults = acc[queryText].totalResults / acc[queryText].count;
    return acc;
  }, {}) || {};

  const sortedQueries = Object.values(searchQueries)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 20);

  const zeroResultSearches = events?.filter(e => e.event_value === 0).length || 0;

  return {
    totalSearches: events?.length || 0,
    topQueries: sortedQueries,
    zeroResultSearches,
    zeroResultRate: events?.length 
      ? parseFloat(((zeroResultSearches / events.length) * 100).toFixed(2)) 
      : 0,
  };
}

/**
 * Real-time active users (last 5 minutes)
 */
async function getRealtimeUsers() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('session_id, platform, page_path')
    .gte('created_at', fiveMinutesAgo);

  if (error) throw error;

  const uniqueSessions = new Set(events?.map(e => e.session_id));
  const byPlatform = events?.reduce((acc: Record<string, Set<string>>, e) => {
    if (!acc[e.platform]) acc[e.platform] = new Set();
    acc[e.platform].add(e.session_id);
    return acc;
  }, {}) || {};

  const topPages = events?.reduce((acc: Record<string, number>, e) => {
    acc[e.page_path] = (acc[e.page_path] || 0) + 1;
    return acc;
  }, {}) || {};

  return {
    activeUsers: uniqueSessions.size,
    byPlatform: Object.entries(byPlatform).map(([platform, sessions]) => ({
      platform,
      users: sessions.size,
    })),
    topPages: Object.entries(topPages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({ path, count })),
  };
}

/**
 * Log legacy activity (for backward compatibility)
 */
async function logActivity(userId: string | null, action: string, resourceType: string, resourceId?: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Parse body for POST requests
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        // No body or invalid JSON
      }
    }

    console.log(`[ANALYTICS-SERVICE] Action: ${action || 'default'}`);

    switch (action) {
      case 'config': {
        const config = getConfig();
        return new Response(JSON.stringify(config), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track': {
        const event: AnalyticsEvent = body;
        await storeEvent(event);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'statistics': {
        const startDate = url.searchParams.get('startDate') || 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = url.searchParams.get('endDate') || new Date().toISOString();
        const platform = url.searchParams.get('platform') || undefined;
        
        const stats = await getStatistics({ startDate, endDate, platform });
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'content': {
        const startDate = url.searchParams.get('startDate') || 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = url.searchParams.get('endDate') || new Date().toISOString();
        const contentType = url.searchParams.get('contentType') || undefined;
        
        const metrics = await getContentMetrics({ startDate, endDate, contentType });
        return new Response(JSON.stringify(metrics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'search': {
        const startDate = url.searchParams.get('startDate') || 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = url.searchParams.get('endDate') || new Date().toISOString();
        const platform = url.searchParams.get('platform') || undefined;
        
        const metrics = await getSearchMetrics({ startDate, endDate, platform });
        return new Response(JSON.stringify(metrics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'realtime': {
        const data = await getRealtimeUsers();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Legacy support for 'log' action
      case 'log': {
        const authHeader = req.headers.get('Authorization');
        let currentUserId = null;
        
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data } = await supabase.auth.getUser(token);
          currentUserId = data.user?.id;
        }

        const { event, resource_type, resource_id, metadata } = body;
        const data = await logActivity(currentUserId, event, resource_type, resource_id, metadata);
        
        return new Response(JSON.stringify({ success: true, log: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Legacy support for 'get_stats' action
      case 'get_stats': {
        const stats = await Promise.all([
          supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
          supabase.from('activity_logs')
            .select('user_id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('activity_logs').select('action').limit(1000),
        ]);

        const topActions = stats[2].data?.reduce((acc: Record<string, number>, log: any) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {});

        return new Response(JSON.stringify({
          total_activities: stats[0].count,
          active_users_30d: stats[1].count,
          top_actions: topActions,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default: {
        return new Response(JSON.stringify({
          message: 'BNRM Analytics Service',
          version: '2.0.0',
          actions: ['config', 'track', 'statistics', 'content', 'search', 'realtime', 'log', 'get_stats'],
          ga4_enabled: getConfig().ga4.enabled,
          matomo_enabled: getConfig().matomo.enabled,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (error) {
    console.error('[ANALYTICS-SERVICE] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
