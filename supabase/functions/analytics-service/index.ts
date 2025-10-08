import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsRequest {
  action: 'log' | 'get_stats' | 'get_user_activity' | 'get_content_stats';
  event?: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  start_date?: string;
  end_date?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { action, event, resource_type, resource_id, metadata, start_date, end_date, user_id }: AnalyticsRequest = await req.json();

    console.log(`[ANALYTICS-SERVICE] Action: ${action}`);

    switch (action) {
      case 'log': {
        // Log une activité
        const authHeader = req.headers.get("Authorization");
        let currentUserId = null;
        
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const { data } = await supabaseClient.auth.getUser(token);
          currentUserId = data.user?.id;
        }

        const { data, error } = await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: currentUserId,
            action: event,
            resource_type,
            resource_id,
            details: metadata,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, log: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_stats': {
        // Récupère les statistiques globales
        const stats = await Promise.all([
          // Total des visites
          supabaseClient
            .from('activity_logs')
            .select('*', { count: 'exact', head: true }),
          
          // Utilisateurs actifs (derniers 30 jours)
          supabaseClient
            .from('activity_logs')
            .select('user_id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          
          // Top actions
          supabaseClient
            .from('activity_logs')
            .select('action')
            .limit(1000),
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_user_activity': {
        // Récupère l'activité d'un utilisateur
        const { data, error } = await supabaseClient
          .from('activity_logs')
          .select('*')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        return new Response(JSON.stringify({ activities: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_content_stats': {
        // Statistiques de contenu
        const contentStats = await supabaseClient
          .from('content')
          .select('content_type, status, view_count')
          .gte('created_at', start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const manuscriptStats = await supabaseClient
          .from('manuscripts')
          .select('*', { count: 'exact', head: true });

        return new Response(JSON.stringify({
          content: contentStats.data,
          total_manuscripts: manuscriptStats.count,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    console.error('[ANALYTICS-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
