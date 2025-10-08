import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentRequest {
  action: 'get_document' | 'create_document' | 'update_document' | 'delete_document' | 'list_documents' | 'get_metadata';
  document_id?: string;
  document_type?: 'manuscript' | 'content' | 'legal_deposit';
  title?: string;
  metadata?: Record<string, any>;
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
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      user = userData.user;
    }

    const { action, document_id, document_type, title, metadata, filters }: DocumentRequest = await req.json();

    console.log(`[DOCUMENT-SERVICE] Action: ${action}, Type: ${document_type}`);

    switch (action) {
      case 'get_document': {
        let data, error;

        if (document_type === 'manuscript') {
          ({ data, error } = await supabaseClient
            .from('manuscripts')
            .select('*')
            .eq('id', document_id)
            .single());
        } else if (document_type === 'content') {
          ({ data, error } = await supabaseClient
            .from('content')
            .select('*')
            .eq('id', document_id)
            .single());
        } else {
          ({ data, error } = await supabaseClient
            .from('legal_deposit_requests')
            .select('*')
            .eq('id', document_id)
            .single());
        }

        if (error) throw error;

        return new Response(JSON.stringify({ document: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'list_documents': {
        let query = supabaseClient
          .from(document_type === 'manuscript' ? 'manuscripts' : 
                document_type === 'content' ? 'content' : 'legal_deposit_requests')
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

        return new Response(JSON.stringify({ documents: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_metadata': {
        // Récupère les métadonnées enrichies d'un document
        const { data, error } = await supabaseClient
          .from('catalog_metadata')
          .select('*')
          .or(`manuscript_id.eq.${document_id},content_id.eq.${document_id}`)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        return new Response(JSON.stringify({ metadata: data || {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'update_document': {
        if (!user) throw new Error("Authentication required");

        let data, error;

        if (document_type === 'manuscript') {
          ({ data, error } = await supabaseClient
            .from('manuscripts')
            .update(metadata)
            .eq('id', document_id)
            .select()
            .single());
        } else if (document_type === 'content') {
          ({ data, error } = await supabaseClient
            .from('content')
            .update(metadata)
            .eq('id', document_id)
            .select()
            .single());
        }

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action: 'document_updated',
            resource_type: document_type,
            resource_id: document_id,
            details: metadata,
          });

        return new Response(JSON.stringify({ success: true, document: data }), {
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
    console.error('[DOCUMENT-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
