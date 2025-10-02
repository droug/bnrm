import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { resourceId, resourceType, sourceFormat, targetFormat } = await req.json();

    // Créer l'action de migration
    const { data: action, error: actionError } = await supabaseClient
      .from('preservation_actions')
      .insert({
        content_id: resourceType === 'content' ? resourceId : null,
        manuscript_id: resourceType === 'manuscript' ? resourceId : null,
        action_type: 'format_migration',
        status: 'in_progress',
        source_format: sourceFormat,
        target_format: targetFormat,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (actionError) throw actionError;

    // Simuler la migration (à remplacer par la vraie logique)
    console.log(`Migration de ${sourceFormat} vers ${targetFormat} pour ${resourceType} ${resourceId}`);
    
    // Mettre à jour le statut après migration
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation

    const { error: updateError } = await supabaseClient
      .from('preservation_actions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', action.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        action,
        message: `Migration de ${sourceFormat} vers ${targetFormat} réussie` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});