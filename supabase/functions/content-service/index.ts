import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentRequest {
  action: 'create' | 'update' | 'publish' | 'archive' | 'get' | 'list' | 'translate';
  content_id?: string;
  content_type?: string;
  title?: string;
  content_body?: string;
  status?: string;
  language?: string;
  filters?: Record<string, any>;
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { 
      action, 
      content_id, 
      content_type, 
      title, 
      content_body, 
      status,
      language,
      filters 
    }: ContentRequest = await req.json();

    console.log(`[CONTENT-SERVICE] Action: ${action}`);

    switch (action) {
      case 'create': {
        // Générer le slug à partir du titre
        const slug = title?.toLowerCase()
          .replace(/[àáâãäå]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'content';

        const { data, error } = await supabaseClient
          .from('content')
          .insert({
            author_id: user.id,
            content_type,
            title,
            slug,
            content_body,
            status: status || 'draft',
          })
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'content_created',
            resource_type: 'content',
            resource_id: data.id,
            details: { content_type, title },
          });

        return new Response(JSON.stringify({ success: true, content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'update': {
        const { data, error } = await supabaseClient
          .from('content')
          .update({
            title,
            content_body,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', content_id)
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'content_updated',
            resource_type: 'content',
            resource_id: content_id,
          });

        return new Response(JSON.stringify({ success: true, content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'publish': {
        const { data, error } = await supabaseClient
          .from('content')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', content_id)
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'content_published',
            resource_type: 'content',
            resource_id: content_id,
          });

        return new Response(JSON.stringify({ success: true, content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'archive': {
        const { data, error } = await supabaseClient
          .from('content')
          .update({ status: 'archived' })
          .eq('id', content_id)
          .select()
          .single();

        if (error) throw error;

        // Log dans archiving_logs
        await supabaseClient
          .from('archiving_logs')
          .insert({
            content_id,
            content_type: data.content_type,
            content_title: data.title,
            action: 'archived',
            old_status: 'published',
            new_status: 'archived',
            executed_by: user.id,
            reason: 'Manual archiving',
          });

        return new Response(JSON.stringify({ success: true, content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get': {
        const { data, error } = await supabaseClient
          .from('content')
          .select('*')
          .eq('id', content_id)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'list': {
        let query = supabaseClient
          .from('content')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        // Appliquer les filtres
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              query = query.eq(key, value);
            }
          });
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ content: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'translate': {
        // Récupère ou crée une traduction
        const { data: translation, error: translationError } = await supabaseClient
          .from('content_translations')
          .select('*')
          .eq('content_id', content_id)
          .eq('language_code', language)
          .maybeSingle();

        if (translationError) throw translationError;

        return new Response(JSON.stringify({ translation }), {
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
    console.error('[CONTENT-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
