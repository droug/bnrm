import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL de l'application - toujours utiliser https://bnrm-dev.digiup.ma
const SITE_URL = Deno.env.get("SITE_URL")?.replace(/\/$/, "") || "https://bnrm-dev.digiup.ma";

interface NotificationRequest {
  action: 'send_email' | 'create_notification' | 'get_notifications' | 'mark_read';
  recipient_email?: string;
  recipient_id?: string;
  subject?: string;
  message?: string;
  html_content?: string;
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
      html_content,
      notification_type,
      request_id,
      notification_id 
    }: NotificationRequest = await req.json();

    console.log(`[NOTIFICATION-SERVICE] Action: ${action}`);

    switch (action) {
      case 'send_email': {
        if (!recipient_email || !subject) {
          throw new Error("recipient_email et subject sont requis");
        }

        // Générer le contenu HTML si non fourni
        const emailHtml = html_content || generateDefaultEmailHtml(subject, message || "", SITE_URL);

        // Utiliser le client SMTP unifié
        const emailResult = await sendEmail({
          to: recipient_email,
          subject: subject,
          html: emailHtml
        });

        if (!emailResult.success) {
          console.error("[NOTIFICATION-SERVICE] Email sending failed:", emailResult.error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: emailResult.error 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        console.log(`[NOTIFICATION-SERVICE] Email sent to ${recipient_email} via ${emailResult.method}`);
        
        // Log l'activité
        await supabaseClient
          .from('activity_logs')
          .insert({
            user_id: null,
            action: 'email_sent',
            resource_type: 'notification',
            details: { 
              recipient_email, 
              subject, 
              method: emailResult.method,
              message_id: emailResult.messageId 
            },
          });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Email envoyé avec succès',
          method: emailResult.method,
          message_id: emailResult.messageId
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

        // Si email fourni, envoyer aussi par email via SMTP unifié
        if (recipient_email && subject) {
          const emailHtml = html_content || generateDefaultEmailHtml(subject, message || "", SITE_URL);
          
          const emailResult = await sendEmail({
            to: recipient_email,
            subject: subject,
            html: emailHtml
          });

          if (emailResult.success) {
            console.log(`[NOTIFICATION-SERVICE] Email notification sent to ${recipient_email}`);
          } else {
            console.warn(`[NOTIFICATION-SERVICE] Failed to send email: ${emailResult.error}`);
          }
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
  } catch (error: any) {
    console.error('[NOTIFICATION-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/**
 * Génère un template HTML par défaut pour les emails
 */
function generateDefaultEmailHtml(title: string, content: string, siteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BNRM - Bibliothèque Nationale</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">Royaume du Maroc</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 20px;">${title}</h2>
          
          <div style="color: #4a5568; font-size: 16px; line-height: 1.6;">
            ${content}
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${siteUrl}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
              Accéder à la plateforme
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 12px; margin: 0;">
            Bibliothèque Nationale du Royaume du Maroc<br>
            Avenue Ibn Khaldoun, Rabat, Maroc<br>
            Tél: +212 537 77 18 33 | Email: contact@bnrm.ma
          </p>
          <p style="color: #a0aec0; font-size: 11px; margin: 10px 0 0 0;">
            <a href="${siteUrl}" style="color: #1e3a5f; text-decoration: none;">${siteUrl.replace('https://', '')}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
