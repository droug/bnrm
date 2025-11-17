import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event_type: string;
  entity_type: string;
  entity_id: string;
  data: any;
  timestamp: string;
}

async function sendWebhook(url: string, payload: WebhookPayload, secret?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'BNRM-CMS-Webhook/1.0'
  };

  if (secret) {
    // Ajouter une signature HMAC pour sécuriser le webhook
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    headers['X-Webhook-Signature'] = signatureHex;
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text();

    return {
      success: response.ok,
      status: response.status,
      responseTime,
      responseBody: response.ok ? responseBody : `Error: ${response.statusText} - ${responseBody}`,
      error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      status: 0,
      responseTime,
      responseBody: '',
      error: error.message || 'Network error'
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { event_type, entity_type, entity_id, data } = await req.json();

    console.log(`📡 Webhook trigger: ${event_type} on ${entity_type}`, { entity_id });

    // Récupérer tous les webhooks actifs pour ce type d'événement
    const { data: webhooks, error: webhooksError } = await supabase
      .from('cms_webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('event_types', [event_type]);

    if (webhooksError) {
      throw new Error(`Failed to fetch webhooks: ${webhooksError.message}`);
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('⚠️ No active webhooks configured for this event type');
      return new Response(
        JSON.stringify({ 
          message: 'No active webhooks configured',
          event_type,
          entity_type 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Sending to ${webhooks.length} webhook(s)`);

    const payload: WebhookPayload = {
      event_type,
      entity_type,
      entity_id,
      data,
      timestamp: new Date().toISOString()
    };

    // Envoyer les webhooks en parallèle
    const results = await Promise.all(
      webhooks.map(async (webhook) => {
        const result = await sendWebhook(webhook.url, payload, webhook.secret);
        
        // Enregistrer le log
        const logEntry = {
          webhook_id: webhook.id,
          event_type,
          payload,
          status: result.status,
          response_time_ms: result.responseTime,
          response_body: result.responseBody,
          success: result.success,
          error_message: result.error
        };

        await supabase
          .from('cms_webhook_logs')
          .insert(logEntry);

        // Mettre à jour les statistiques du webhook
        if (result.success) {
          await supabase.rpc('increment', {
            table_name: 'cms_webhooks',
            row_id: webhook.id,
            column_name: 'success_count'
          }).catch(() => {
            // Fallback si la fonction n'existe pas
            supabase
              .from('cms_webhooks')
              .update({ 
                success_count: webhook.success_count + 1,
                last_triggered_at: new Date().toISOString()
              })
              .eq('id', webhook.id);
          });
        } else {
          await supabase
            .from('cms_webhooks')
            .update({ 
              failure_count: webhook.failure_count + 1,
              last_triggered_at: new Date().toISOString()
            })
            .eq('id', webhook.id);
        }

        return {
          webhook_name: webhook.name,
          webhook_url: webhook.url,
          ...result
        };
      })
    );

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };

    console.log('✅ Webhooks sent:', summary);

    return new Response(
      JSON.stringify({
        message: 'Webhooks processed',
        summary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
