import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  action: 'send_email' | 'create_notification' | 'get_notifications' | 'mark_read';
  recipient_email?: string;
  recipient_id?: string;
  subject?: string;
  message?: string;
  notification_type?: string;
  request_id?: string;
  notification_id?: string;
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
    const { 
      action, 
      recipient_email, 
      recipient_id, 
      subject, 
      message, 
      notification_type,
      request_id,
      notification_id 
    }: NotificationRequest = await req.json();

    console.log(`[NOTIFICATION-SERVICE] Action: ${action}`);

    switch (action) {
      case 'send_email': {
        // TODO: Intégrer avec Resend ou un service email
        // Pour l'instant, on simule l'envoi
        console.log(`Sending email to ${recipient_email}: ${subject}`);
        
        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: null,
            action: 'email_sent',
            resource_type: 'notification',
            details: { recipient_email, subject, message },
          });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Email envoyé (simulation)' 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'create_notification': {
        // Crée une notification dans la base de données
        const { data, error } = await supabaseClient
          .from('deposit_notifications')
          .insert({
            recipient_id,
            request_id,
            notification_type,
            title: subject,
            message,
          })
          .select()
          .single();

        if (error) throw error;

        // Si email fourni, envoyer aussi par email
        if (recipient_email) {
          console.log(`Email notification to ${recipient_email}: ${subject}`);
        }

        return new Response(JSON.stringify({ success: true, notification: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_notifications': {
        // Récupère les notifications d'un utilisateur
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("No authorization header");

        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        const user = userData.user;
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabaseClient
          .from('deposit_notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ notifications: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'mark_read': {
        // Marque une notification comme lue
        const { data, error } = await supabaseClient
          .from('deposit_notifications')
          .update({ is_read: true })
          .eq('id', notification_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, notification: data }), {
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
    console.error('[NOTIFICATION-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
