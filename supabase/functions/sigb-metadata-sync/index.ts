import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sigbUrl, mode = 'manual' } = await req.json();

    if (!sigbUrl) {
      throw new Error('URL du SIGB requise');
    }

    console.log(`Synchronisation ${mode} depuis ${sigbUrl}`);

    // Appel au SIGB pour récupérer les métadonnées
    const sigbResponse = await fetch(sigbUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!sigbResponse.ok) {
      throw new Error(`Erreur SIGB: ${sigbResponse.statusText}`);
    }

    const sigbData = await sigbResponse.json();
    
    // Transformation des données du SIGB au format de la base
    const transformedData = Array.isArray(sigbData) ? sigbData : [sigbData];
    const metadataRecords = transformedData.map((record: any) => ({
      main_author: record.author || record.creator,
      title: record.title,
      original_title: record.originalTitle,
      subtitle: record.subtitle,
      co_authors: record.contributors || [],
      publication_year: record.publicationDate ? parseInt(record.publicationDate) : null,
      publisher: record.publisher,
      publication_place: record.publicationPlace,
      isbn: record.isbn,
      issn: record.issn,
      subjects: record.subjects || [],
      keywords: record.keywords || [],
      physical_description: record.physicalDescription,
      page_count: record.pageCount ? parseInt(record.pageCount) : null,
      source_sigb: sigbUrl,
      source_record_id: record.recordId || record.id,
      last_sync_date: new Date().toISOString(),
      // Champs personnalisés
      custom_fields: {
        sigb_record_type: record.recordType,
        sigb_collection: record.collection,
        original_data: record,
      }
    }));

    // Insertion ou mise à jour dans la base
    const { data, error } = await supabaseClient
      .from('catalog_metadata')
      .upsert(metadataRecords, {
        onConflict: 'source_record_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Erreur insertion:', error);
      throw error;
    }

    // Log de l'activité
    await supabaseClient.from('activity_logs').insert({
      action: 'sigb_metadata_sync',
      resource_type: 'catalog_metadata',
      details: {
        mode,
        sigb_url: sigbUrl,
        records_imported: data?.length || 0,
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        imported: data?.length || 0,
        records: data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur synchronisation SIGB:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});