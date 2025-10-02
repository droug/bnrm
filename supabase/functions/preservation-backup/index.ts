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

    const { resourceType, backupType, resourceId } = await req.json();

    console.log('Creating backup:', { resourceType, backupType, resourceId });

    // Simuler la création d'une sauvegarde
    const checksum = crypto.randomUUID(); // Dans un vrai système, calculer le checksum réel
    const backupLocation = `backups/${resourceType}/${new Date().toISOString()}/backup.tar.gz`;
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 an de rétention

    const { data: backup, error: backupError } = await supabase
      .from('preservation_backups')
      .insert({
        resource_type: resourceType,
        resource_id: resourceId,
        backup_type: backupType,
        backup_location: backupLocation,
        checksum: checksum,
        backup_size_mb: Math.random() * 100, // Simulé
        retention_period_days: 365,
        expiry_date: expiryDate.toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id,
        metadata: {
          created_at: now.toISOString(),
          backup_method: 'automated'
        }
      })
      .select()
      .single();

    if (backupError) throw backupError;

    // Créer une action de préservation
    const { error: actionError } = await supabase
      .from('preservation_actions')
      .insert({
        action_type: 'backup',
        status: 'completed',
        performed_by: (await supabase.auth.getUser()).data.user?.id,
        backup_location: backupLocation,
        checksum_after: checksum,
        started_at: now.toISOString(),
        completed_at: new Date().toISOString(),
        metadata: {
          backup_id: backup.id,
          backup_type: backupType
        }
      });

    if (actionError) throw actionError;

    console.log('Backup created successfully:', backup.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup: backup,
        message: 'Sauvegarde créée avec succès'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error creating backup:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erreur lors de la création de la sauvegarde'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
