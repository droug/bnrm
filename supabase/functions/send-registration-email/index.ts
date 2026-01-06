import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  email_type: 'registration_received' | 'account_validated' | 'account_rejected' | 'password_reset';
  recipient_email: string;
  recipient_name: string;
  user_type?: string; // 'editor' | 'printer' | 'producer' | 'researcher' | 'visitor'
  rejection_reason?: string;
  reset_link?: string;
  additional_data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: RegistrationEmailRequest = await req.json();
    const { email_type, recipient_email, recipient_name, user_type, rejection_reason, reset_link, additional_data } = request;

    console.log("Sending registration email:", { email_type, recipient_email, user_type });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    
    // Générer le contenu de l'email selon le type
    const { subject, html } = generateEmailContent(email_type, {
      recipient_name,
      user_type,
      rejection_reason,
      reset_link,
      additional_data
    });

    // Envoyer l'email
    const emailResult = await resend.emails.send({
      from: "BNRM - Bibliothèque Nationale <onboarding@resend.dev>",
      to: [recipient_email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResult);

    // Créer une notification système également
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Trouver l'utilisateur par email pour créer la notification
    const { data: userData } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", recipient_email)
      .single();

    if (userData?.id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: userData.id,
        title: getNotificationTitle(email_type),
        message: getNotificationMessage(email_type, user_type, rejection_reason),
        notification_type: email_type,
        is_read: false,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email envoyé avec succès",
        email_id: emailResult.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-registration-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getNotificationTitle(email_type: string): string {
  switch (email_type) {
    case 'registration_received':
      return "Inscription reçue";
    case 'account_validated':
      return "Compte validé";
    case 'account_rejected':
      return "Inscription non approuvée";
    case 'password_reset':
      return "Réinitialisation du mot de passe";
    default:
      return "Notification";
  }
}

function getNotificationMessage(email_type: string, user_type?: string, rejection_reason?: string): string {
  const roleLabel = getRoleLabel(user_type);
  
  switch (email_type) {
    case 'registration_received':
      return `Votre inscription en tant que ${roleLabel} a été reçue et est en cours de traitement.`;
    case 'account_validated':
      return `Félicitations ! Votre compte ${roleLabel} a été validé. Vous pouvez maintenant accéder à tous les services.`;
    case 'account_rejected':
      return `Votre demande d'inscription n'a pas pu être approuvée. ${rejection_reason ? `Motif: ${rejection_reason}` : ''}`;
    case 'password_reset':
      return "Un lien de réinitialisation de mot de passe vous a été envoyé par email.";
    default:
      return "";
  }
}

function getRoleLabel(user_type?: string): string {
  const labels: Record<string, string> = {
    editor: "Éditeur",
    printer: "Imprimeur",
    producer: "Producteur",
    researcher: "Chercheur",
    visitor: "Visiteur",
    professional: "Professionnel"
  };
  return labels[user_type || ''] || "utilisateur";
}

function generateEmailContent(
  email_type: string, 
  data: { 
    recipient_name: string; 
    user_type?: string; 
    rejection_reason?: string; 
    reset_link?: string;
    additional_data?: Record<string, any>;
  }
): { subject: string; html: string } {
  const { recipient_name, user_type, rejection_reason, reset_link } = data;
  const roleLabel = getRoleLabel(user_type);

  const baseStyle = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header img { max-width: 150px; margin-bottom: 15px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #002B45; border-radius: 4px; }
        .success-box { background: #e8f5e9; border-left-color: #4caf50; }
        .warning-box { background: #fff3e0; border-left-color: #ff9800; }
        .error-box { background: #ffebee; border-left-color: #f44336; }
        .btn { display: inline-block; padding: 12px 30px; background: #002B45; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .btn:hover { background: #004d7a; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #002B45; margin-top: 0; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
        </div>
        <div class="content">
  `;

  const footerHtml = `
        </div>
        <div class="footer">
          <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong></p>
          <p>Avenue Ibn Khaldoun, Rabat, Maroc</p>
          <p>Tél: +212 537 77 18 33 | Email: contact@bnrm.ma</p>
          <p><a href="https://www.bnrm.ma">www.bnrm.ma</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  switch (email_type) {
    case 'registration_received':
      return {
        subject: `Inscription reçue - BNRM`,
        html: `${baseStyle}
          <h2>Bonjour ${recipient_name},</h2>
          <p>Nous avons bien reçu votre demande d'inscription en tant que <strong>${roleLabel}</strong> auprès de la Bibliothèque Nationale du Royaume du Maroc.</p>
          
          <div class="info-box">
            <h3>📋 Prochaines étapes</h3>
            <ul>
              <li>Votre demande sera examinée par notre équipe</li>
              <li>Le délai de traitement est de <strong>10 jours ouvrables</strong></li>
              <li>Vous recevrez un email de confirmation une fois votre compte validé</li>
            </ul>
          </div>
          
          <p>En cas de questions, n'hésitez pas à nous contacter à <a href="mailto:inscription@bnrm.ma">inscription@bnrm.ma</a></p>
          
          <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
        ${footerHtml}`
      };

    case 'account_validated':
      return {
        subject: `Compte validé - Bienvenue à la BNRM`,
        html: `${baseStyle}
          <h2>Félicitations ${recipient_name} !</h2>
          
          <div class="info-box success-box">
            <h3>✅ Votre compte a été validé</h3>
            <p>Votre inscription en tant que <strong>${roleLabel}</strong> a été approuvée.</p>
          </div>
          
          <p>Vous pouvez désormais accéder à l'ensemble des services de la Bibliothèque Nationale :</p>
          
          <ul>
            <li>Consulter et emprunter des ouvrages</li>
            <li>Accéder aux ressources numériques</li>
            <li>Effectuer des demandes de dépôt légal</li>
            <li>Réserver des espaces culturels</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="https://www.bnrm.ma/auth" class="btn">Accéder à mon espace</a>
          </p>
          
          <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
        ${footerHtml}`
      };

    case 'account_rejected':
      return {
        subject: `Information sur votre demande d'inscription - BNRM`,
        html: `${baseStyle}
          <h2>Bonjour ${recipient_name},</h2>
          
          <div class="info-box error-box">
            <h3>❌ Demande non approuvée</h3>
            <p>Nous regrettons de vous informer que votre demande d'inscription en tant que <strong>${roleLabel}</strong> n'a pas pu être approuvée.</p>
          </div>
          
          ${rejection_reason ? `
          <div class="info-box warning-box">
            <h3>📝 Motif</h3>
            <p>${rejection_reason}</p>
          </div>
          ` : ''}
          
          <p>Vous pouvez soumettre une nouvelle demande en corrigeant les éléments mentionnés ou nous contacter pour plus d'informations.</p>
          
          <p>Pour toute question, contactez-nous à <a href="mailto:inscription@bnrm.ma">inscription@bnrm.ma</a></p>
          
          <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
        ${footerHtml}`
      };

    case 'password_reset':
      return {
        subject: `Réinitialisation de votre mot de passe - BNRM`,
        html: `${baseStyle}
          <h2>Bonjour ${recipient_name},</h2>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte BNRM.</p>
          
          <div class="info-box">
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${reset_link || '#'}" class="btn">Réinitialiser mon mot de passe</a>
          </p>
          
          <p><strong>⚠️ Important :</strong> Ce lien expire dans 24 heures.</p>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
          
          <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
        ${footerHtml}`
      };

    default:
      return {
        subject: `Notification - BNRM`,
        html: `${baseStyle}
          <h2>Bonjour ${recipient_name},</h2>
          <p>Vous avez reçu une notification de la Bibliothèque Nationale du Royaume du Maroc.</p>
          <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
        ${footerHtml}`
      };
  }
}
