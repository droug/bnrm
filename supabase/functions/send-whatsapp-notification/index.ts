import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    if (!WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
    }

    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is not configured');
    }

    const { action, to, template_name, template_language, template_parameters, text_message } = await req.json();

    // Action: send_template (notification) or send_text (test) or verify_connection
    if (action === 'verify_connection') {
      // Verify the WhatsApp Business Account connection
      const response = await fetch(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`WhatsApp API verification failed [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify({
        success: true,
        phone_number: data.display_phone_number,
        verified_name: data.verified_name,
        quality_rating: data.quality_rating,
        status: data.code_verification_status,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'send_text') {
      // Send a simple text message (for testing)
      const response = await fetch(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/[^0-9]/g, ''),
            type: 'text',
            text: {
              preview_url: false,
              body: text_message || 'Test de notification BNRM - WhatsApp Business API',
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`WhatsApp send failed [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message_id: data.messages?.[0]?.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'send_template') {
      // Send a template message (for notifications)
      const components = template_parameters?.length > 0
        ? [{
            type: 'body',
            parameters: template_parameters.map((p: string) => ({
              type: 'text',
              text: p,
            })),
          }]
        : undefined;

      const response = await fetch(
        `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
              name: template_name || 'hello_world',
              language: {
                code: template_language || 'fr',
              },
              ...(components && { components }),
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`WhatsApp template send failed [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message_id: data.messages?.[0]?.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: unknown) {
    console.error('WhatsApp notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
