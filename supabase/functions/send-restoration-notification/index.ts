import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  recipientEmail: string;
  recipientId: string;
  notificationType: string;
  requestNumber: string;
  manuscriptTitle: string;
  quoteAmount?: number;
  additionalInfo?: string;
  paymentUrl?: string;
}

const getEmailContent = (n: NotificationRequest) => {
  const { notificationType, requestNumber, manuscriptTitle, quoteAmount, additionalInfo, paymentUrl } = n;
  const base = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`;
  const footer = `<p>Cordialement,<br>L'équipe de restauration - BNRM</p></div>`;
  
  switch (notificationType) {
    case 'request_received':
      return { subject: `Demande de restauration reçue - ${requestNumber}`, html: `${base}<h2 style="color: #2c5aa0;">Demande de restauration enregistrée</h2><p>Votre demande a été enregistrée.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p><strong>Numéro:</strong> ${requestNumber}</p><p><strong>Manuscrit:</strong> ${manuscriptTitle}</p></div>${footer}` };
    case 'authorized':
      return { 
        subject: `Demande de restauration autorisée - ${requestNumber}`, 
        html: `${base}
          <h2 style="color: #2c5aa0;">Demande de restauration autorisée</h2>
          <p>Nous avons le plaisir de vous informer que votre demande de restauration a été <strong>autorisée</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Numéro de demande:</strong> ${requestNumber}</p>
            <p><strong>Œuvre concernée:</strong> ${manuscriptTitle}</p>
          </div>
          <div style="background-color: #e8f4fd; border-left: 4px solid #2c5aa0; padding: 15px; margin: 20px 0;">
            <h3 style="color: #2c5aa0; margin-top: 0;">📋 Prochaine étape</h3>
            <p style="margin-bottom: 0;"><strong>Veuillez vous présenter au Service de Restauration de la BNRM</strong> afin d'apporter votre œuvre pour le diagnostic et les travaux de restauration.</p>
          </div>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Informations importantes</h4>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li>Munissez-vous de ce numéro de demande: <strong>${requestNumber}</strong></li>
              <li>Apportez une pièce d'identité valide</li>
              <li>L'œuvre doit être protégée pour le transport</li>
            </ul>
          </div>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
          ${footer}` 
      };
    case 'quote_sent':
      return { subject: `Devis disponible - ${requestNumber}`, html: `${base}<h2 style="color: #2c5aa0;">Devis disponible</h2><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p><strong>Numéro:</strong> ${requestNumber}</p><p><strong>Manuscrit:</strong> ${manuscriptTitle}</p>${quoteAmount ? `<p><strong>Montant:</strong> ${quoteAmount} DH</p>` : ''}</div>${footer}` };
    case 'payment_confirmed':
      return { subject: `Paiement confirmé - ${requestNumber}`, html: `${base}<h2 style="color: #2c5aa0;">Paiement confirmé</h2><p>Votre paiement a été confirmé. Les travaux vont débuter.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p><strong>Numéro:</strong> ${requestNumber}</p></div>${footer}` };
    case 'restoration_completed':
      return { subject: `Restauration terminée - ${requestNumber}`, html: `${base}<h2 style="color: #2c5aa0;">Restauration terminée</h2><p>Votre manuscrit est prêt à être récupéré.</p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;"><p><strong>Numéro:</strong> ${requestNumber}</p><p><strong>Manuscrit:</strong> ${manuscriptTitle}</p></div>${footer}` };
    default:
      return { subject: `Notification - ${requestNumber}`, html: `${base}<h2 style="color: #2c5aa0;">Mise à jour</h2><p>Mise à jour concernant votre demande ${requestNumber}.</p>${footer}` };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const notification: NotificationRequest = await req.json();
    
    console.log("[RESTORATION-NOTIF] Sending notification to:", notification.recipientEmail);

    await supabase.from('restoration_notifications').insert({
      request_id: notification.requestId, recipient_id: notification.recipientId,
      notification_type: notification.notificationType, title: getEmailContent(notification).subject,
      message: `Mise à jour: ${notification.requestNumber}`, is_read: false
    });

    const emailContent = getEmailContent(notification);
    
    // Use unified SMTP client
    const result = await sendEmail({
      to: notification.recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log("[RESTORATION-NOTIF] Email result:", result);
    
    return new Response(JSON.stringify({ success: true, email_sent: result.success, method: result.method }), 
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("[RESTORATION-NOTIF] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
