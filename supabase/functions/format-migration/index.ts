import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sourceFormat, targetFormat, resourceType, resourceId } = await req.json();

    console.log('Starting format migration:', { sourceFormat, targetFormat, resourceType });

    // Créer une action de migration
    const { data: action, error: actionError } = await supabase
      .from('preservation_actions')
      .insert({
        action_type: 'format_migration',
        status: 'in_progress',
        source_format: sourceFormat,
        target_format: targetFormat,
        performed_by: (await supabase.auth.getUser()).data.user?.id,
        started_at: new Date().toISOString(),
        metadata: {
          resource_type: resourceType,
          resource_id: resourceId
        }
      })
      .select()
      .single();

    if (actionError) throw actionError;

    // Simuler la migration (dans un vrai système, effectuer la conversion ici)
    console.log('Performing migration simulation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mettre à jour l'action comme terminée
    const { error: updateError } = await supabase
      .from('preservation_actions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        checksum_after: crypto.randomUUID() // Simulé
      })
      .eq('id', action.id);

    if (updateError) throw updateError;

    console.log('Migration completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        action: action,
        message: `Migration de ${sourceFormat} vers ${targetFormat} réussie`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in format migration:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erreur lors de la migration de format'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
