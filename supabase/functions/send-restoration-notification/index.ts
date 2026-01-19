import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import nodemailer from "npm:nodemailer@6.9.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fonction d'envoi d'email via SMTP avec fallback Resend
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string; id?: string }> {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SMTP_FROM = Deno.env.get("SMTP_FROM");

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) {
    try {
      const port = parseInt(SMTP_PORT, 10);
      const fromAddress = SMTP_FROM && SMTP_FROM.includes('@') ? SMTP_FROM : SMTP_USER;
      
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST, port, secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      });

      const info = await transporter.sendMail({ from: fromAddress, to, subject, html });
      console.log("[RESTORATION-NOTIF] Email sent via SMTP:", info.messageId);
      return { success: true, id: info.messageId };
    } catch (error: any) {
      console.error("[RESTORATION-NOTIF] SMTP error:", error.message);
    }
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: "BNRM Restauration <onboarding@resend.dev>", to: [to], subject, html }),
      });
      if (!response.ok) { const e = await response.json(); return { success: false, error: e.message }; }
      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error: any) { return { success: false, error: error.message }; }
  }
  return { success: false, error: "No email service configured" };
}

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
    
    await supabase.from('restoration_notifications').insert({
      request_id: notification.requestId, recipient_id: notification.recipientId,
      notification_type: notification.notificationType, title: getEmailContent(notification).subject,
      message: `Mise à jour: ${notification.requestNumber}`, is_read: false
    });

    const emailContent = getEmailContent(notification);
    const result = await sendEmail(notification.recipientEmail, emailContent.subject, emailContent.html);
    
    return new Response(JSON.stringify({ success: true, email_sent: result.success }), 
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
