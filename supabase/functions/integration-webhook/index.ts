import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
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

    // Récupérer le webhook ID depuis l'URL
    const url = new URL(req.url);
    const webhookId = url.searchParams.get('webhook_id');

    if (!webhookId) {
      throw new Error('webhook_id requis dans l\'URL');
    }

    // Récupérer la configuration du webhook
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('integration_webhooks')
      .select('*, external_integrations(*)')
      .eq('id', webhookId)
      .eq('is_active', true)
      .single();

    if (webhookError || !webhook) {
      throw new Error('Webhook non trouvé ou inactif');
    }

    // Obtenir l'IP source
    const sourceIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Vérifier l'IP si une liste blanche est configurée
    if (webhook.allowed_ips && webhook.allowed_ips.length > 0) {
      if (!webhook.allowed_ips.includes(sourceIp)) {
        throw new Error('IP non autorisée');
      }
    }

    // Lire le body
    const body = await req.text();
    const eventData = JSON.parse(body);

    // Vérifier la signature si configurée
    let signatureValid = null;
    if (webhook.webhook_secret) {
      const signature = req.headers.get(webhook.signature_header || 'X-Webhook-Signature');
      signatureValid = await verifySignature(
        body,
        signature,
        webhook.webhook_secret,
        webhook.signature_algorithm || 'sha256'
      );

      if (!signatureValid) {
        throw new Error('Signature invalide');
      }
    }

    // Extraire le type d'événement
    const eventType = eventData.event || eventData.type || eventData.event_type || 'unknown';

    // Vérifier que l'événement est dans la liste autorisée
    if (!webhook.event_types.includes(eventType) && !webhook.event_types.includes('*')) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Événement ignoré (non dans la liste autorisée)' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enregistrer l'événement
    const { data: webhookEvent, error: eventError } = await supabaseClient
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        event_type: eventType,
        event_data: eventData,
        headers: Object.fromEntries(req.headers.entries()),
        source_ip: sourceIp,
        status: 'pending',
        signature_valid: signatureValid,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Traiter l'événement de manière asynchrone
    processWebhookEvent(supabaseClient, webhookEvent.id, eventData, webhook);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: webhookEvent.id,
        message: 'Webhook reçu et en cours de traitement',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function verifySignature(
  payload: string,
  signature: string | null,
  secret: string,
  algorithm: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: algorithm === 'sha256' ? 'SHA-256' : 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Nettoyer la signature reçue (enlever les préfixes comme "sha256=")
    const cleanSignature = signature.replace(/^(sha256|sha512)=/, '');

    return expectedSignature === cleanSignature;
  } catch (error) {
    console.error('Erreur vérification signature:', error);
    return false;
  }
}

async function processWebhookEvent(
  supabase: any,
  eventId: string,
  eventData: any,
  webhook: any
): Promise<void> {
  try {
    await supabase
      .from('webhook_events')
      .update({ status: 'processing' })
      .eq('id', eventId);

    // Traiter selon le type d'événement
    const eventType = eventData.event || eventData.type || eventData.event_type;

    // Mapper les événements aux actions
    if (eventType.includes('user')) {
      await handleUserEvent(supabase, eventData, webhook);
    } else if (eventType.includes('deposit') || eventType.includes('legal_deposit')) {
      await handleDepositEvent(supabase, eventData, webhook);
    } else if (eventType.includes('metadata') || eventType.includes('catalog')) {
      await handleMetadataEvent(supabase, eventData, webhook);
    }

    await supabase
      .from('webhook_events')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId);

  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    await supabase
      .from('webhook_events')
      .update({ 
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', eventId);
  }
}

async function handleUserEvent(supabase: any, eventData: any, webhook: any): Promise<void> {
  const userData = eventData.data || eventData.user;
  if (!userData) return;

  // Appliquer le mapping
  const mapping = webhook.external_integrations?.data_mapping?.users;
  if (mapping) {
    const mappedData: any = {};
    for (const [key, value] of Object.entries(mapping)) {
      mappedData[key] = userData[value as string];
    }
    
    // Upsert dans la table profiles
    await supabase
      .from('profiles')
      .upsert(mappedData, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      });
  }
}

async function handleDepositEvent(supabase: any, eventData: any, webhook: any): Promise<void> {
  const depositData = eventData.data || eventData.deposit;
  if (!depositData) return;

  const mapping = webhook.external_integrations?.data_mapping?.legal_deposits;
  if (mapping) {
    const mappedData: any = {};
    for (const [key, value] of Object.entries(mapping)) {
      mappedData[key] = depositData[value as string];
    }
    
    await supabase
      .from('legal_deposit_requests')
      .upsert(mappedData, {
        onConflict: 'request_number',
        ignoreDuplicates: false,
      });
  }
}

async function handleMetadataEvent(supabase: any, eventData: any, webhook: any): Promise<void> {
  const metadataData = eventData.data || eventData.metadata;
  if (!metadataData) return;

  const mapping = webhook.external_integrations?.data_mapping?.catalog_metadata;
  if (mapping) {
    const mappedData: any = {};
    for (const [key, value] of Object.entries(mapping)) {
      mappedData[key] = metadataData[value as string];
    }
    
    await supabase
      .from('catalog_metadata')
      .upsert(mappedData, {
        onConflict: 'source_record_id',
        ignoreDuplicates: false,
      });
  }
}
