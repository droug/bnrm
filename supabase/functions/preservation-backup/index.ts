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

    const { resourceType, resourceId, backupType } = await req.json();

    // Génération du checksum
    const checksum = crypto.randomUUID(); // Simplification pour l'exemple
    
    // Créer l'enregistrement de sauvegarde
    const { data: backup, error } = await supabaseClient
      .from('preservation_backups')
      .insert({
        resource_type: resourceType,
        resource_id: resourceId,
        backup_type: backupType || 'full',
        backup_location: `/backups/${resourceType}/${resourceId}/${Date.now()}`,
        checksum: checksum,
        backup_size_mb: Math.random() * 100, // Calcul réel nécessaire
        retention_period_days: 365,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Enregistrer l'action de préservation
    await supabaseClient
      .from('preservation_actions')
      .insert({
        content_id: resourceType === 'content' ? resourceId : null,
        manuscript_id: resourceType === 'manuscript' ? resourceId : null,
        action_type: 'backup',
        status: 'completed',
        backup_location: backup.backup_location,
        checksum_after: checksum,
        completed_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup,
        message: 'Sauvegarde créée avec succès' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});