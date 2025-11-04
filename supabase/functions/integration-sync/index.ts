import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  integrationId: string;
  syncType?: 'manual' | 'scheduled';
  entityType?: string;
  filters?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { integrationId, syncType = 'manual', entityType, filters = {} }: SyncRequest = await req.json();

    if (!integrationId) {
      throw new Error('ID d\'intégration requis');
    }

    // Créer un log de synchronisation
    const { data: syncLog, error: logError } = await supabaseClient
      .from('integration_sync_logs')
      .insert({
        integration_id: integrationId,
        sync_type: syncType,
        sync_direction: 'inbound',
        entity_type: entityType,
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) throw logError;

    // Récupérer la configuration de l'intégration
    const { data: integration, error: intError } = await supabaseClient
      .from('external_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('is_active', true)
      .single();

    if (intError || !integration) {
      throw new Error('Intégration non trouvée ou inactive');
    }

    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsFailed = 0;
    let recordsSkipped = 0;

    try {
      // Mise à jour du statut
      await supabaseClient
        .from('integration_sync_logs')
        .update({ status: 'in_progress' })
        .eq('id', syncLog.id);

      // Construire les headers d'authentification
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (integration.auth_type === 'bearer' && integration.auth_credentials?.token) {
        headers['Authorization'] = `Bearer ${integration.auth_credentials.token}`;
      } else if (integration.auth_type === 'api_key' && integration.auth_credentials?.api_key) {
        headers['X-API-Key'] = integration.auth_credentials.api_key;
      } else if (integration.auth_type === 'basic' && integration.auth_credentials?.username && integration.auth_credentials?.password) {
        const credentials = btoa(`${integration.auth_credentials.username}:${integration.auth_credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }

      // Appel à l'API externe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), (integration.timeout_seconds || 30) * 1000);

      const response = await fetch(integration.endpoint_url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur API externe: ${response.status} ${response.statusText}`);
      }

      const externalData = await response.json();
      const records = Array.isArray(externalData) ? externalData : [externalData];

      // Traiter les données par batch
      const batchSize = integration.batch_size || 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        for (const record of batch) {
          recordsProcessed++;

          try {
            // Appliquer le mapping des données
            const mappedData = applyDataMapping(record, integration.data_mapping);

            // Déterminer la table de destination
            const targetTable = getTargetTable(entityType || integration.sync_entities?.[0]);
            if (!targetTable) {
              recordsSkipped++;
              continue;
            }

            // Insérer ou mettre à jour
            const { error: upsertError } = await supabaseClient
              .from(targetTable)
              .upsert(mappedData, {
                onConflict: getConflictKey(targetTable),
                ignoreDuplicates: false,
              });

            if (upsertError) {
              recordsFailed++;
              await logSyncError(supabaseClient, syncLog.id, integrationId, {
                error_type: 'upsert_failed',
                error_message: upsertError.message,
                entity_type: targetTable,
                record_data: record,
              });
            } else {
              recordsSuccess++;
            }
          } catch (error) {
            recordsFailed++;
            await logSyncError(supabaseClient, syncLog.id, integrationId, {
              error_type: 'processing_error',
              error_message: error.message,
              entity_type: entityType,
              record_data: record,
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      // Mettre à jour le log de synchronisation
      await supabaseClient
        .from('integration_sync_logs')
        .update({
          status: recordsFailed > 0 && recordsSuccess === 0 ? 'failed' : recordsFailed > 0 ? 'partial' : 'completed',
          records_total: records.length,
          records_processed: recordsProcessed,
          records_success: recordsSuccess,
          records_failed: recordsFailed,
          records_skipped: recordsSkipped,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', syncLog.id);

      // Mettre à jour la dernière sync de l'intégration
      await supabaseClient
        .from('external_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', integrationId);

      return new Response(
        JSON.stringify({
          success: true,
          sync_log_id: syncLog.id,
          records_total: records.length,
          records_success: recordsSuccess,
          records_failed: recordsFailed,
          records_skipped: recordsSkipped,
          duration_ms: duration,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      const duration = Date.now() - startTime;

      await supabaseClient
        .from('integration_sync_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          records_processed: recordsProcessed,
          records_success: recordsSuccess,
          records_failed: recordsFailed,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', syncLog.id);

      throw error;
    }

  } catch (error) {
    console.error('Erreur synchronisation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function applyDataMapping(record: any, mapping: any): any {
  if (!mapping || typeof mapping !== 'object') {
    return record;
  }

  const mapped: any = {};
  
  for (const [targetField, sourceField] of Object.entries(mapping)) {
    if (typeof sourceField === 'string') {
      // Simple mapping
      mapped[targetField] = getNestedValue(record, sourceField);
    } else if (typeof sourceField === 'object' && sourceField !== null) {
      // Complex mapping avec transformation
      const config = sourceField as any;
      let value = getNestedValue(record, config.source);
      
      if (config.transform === 'uppercase') value = value?.toUpperCase();
      if (config.transform === 'lowercase') value = value?.toLowerCase();
      if (config.transform === 'parseInt') value = parseInt(value);
      if (config.default && !value) value = config.default;
      
      mapped[targetField] = value;
    }
  }
  
  return mapped;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function getTargetTable(entityType?: string): string | null {
  const mapping: Record<string, string> = {
    'legal_deposits': 'legal_deposit_requests',
    'users': 'profiles',
    'catalog_metadata': 'catalog_metadata',
    'manuscripts': 'manuscripts',
  };
  
  return entityType ? mapping[entityType] || null : null;
}

function getConflictKey(table: string): string {
  const keys: Record<string, string> = {
    'legal_deposit_requests': 'request_number',
    'profiles': 'user_id',
    'catalog_metadata': 'source_record_id',
    'manuscripts': 'inventory_number',
  };
  
  return keys[table] || 'id';
}

async function logSyncError(
  supabase: any,
  syncLogId: string,
  integrationId: string,
  error: any
): Promise<void> {
  await supabase.from('integration_sync_errors').insert({
    sync_log_id: syncLogId,
    integration_id: integrationId,
    ...error,
  });
}
