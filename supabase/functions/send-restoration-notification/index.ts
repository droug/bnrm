import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  recipientEmail: string;
  recipientId: string;
  notificationType: 'request_received' | 'quote_sent' | 'quote_accepted' | 'quote_rejected' | 
                    'payment_confirmed' | 'restoration_started' | 'restoration_completed' | 'artwork_ready' |
                    'authorized_deposit_request' | 'quote_rejected';
  requestNumber: string;
  manuscriptTitle: string;
  quoteAmount?: number;
  additionalInfo?: string;
  paymentUrl?: string;
}

const getEmailContent = (notification: NotificationRequest) => {
  const { notificationType, requestNumber, manuscriptTitle, quoteAmount, additionalInfo, paymentUrl } = notification;
  
  switch (notificationType) {
    case 'request_received':
      return {
        subject: `Demande de restauration reçue - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Demande de restauration enregistrée</h2>
            <p>Bonjour,</p>
            <p>Votre demande de restauration a été enregistrée avec succès.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <p>Notre équipe va examiner votre demande et vous contacter prochainement.</p>
            <p>Vous pouvez suivre l'évolution de votre demande dans votre espace personnel.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'quote_sent':
      return {
        subject: `Devis disponible - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Devis de restauration disponible</h2>
            <p>Bonjour,</p>
            <p>Le devis pour votre demande de restauration est maintenant disponible.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
              ${quoteAmount ? `<p><strong>Montant du devis :</strong> ${quoteAmount} DH</p>` : ''}
            </div>
            <p>Veuillez vous connecter à votre espace personnel pour consulter le devis et donner votre réponse.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'authorized_deposit_request':
      return {
        subject: `Demande autorisée - Dépôt de l'œuvre requis - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Demande de restauration autorisée</h2>
            <p>Bonjour,</p>
            <p>Votre demande de restauration a été autorisée par la direction.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p><strong>Prochaine étape :</strong></p>
              <p>Vous devez déposer l'œuvre à la BNRM pour qu'un diagnostic approfondi soit réalisé par notre équipe de restauration.</p>
              <p>Ce diagnostic nous permettra d'établir un devis détaillé des travaux nécessaires.</p>
            </div>
            <p><strong>Informations pratiques :</strong></p>
            <ul>
              <li>Horaires : Du lundi au vendredi, de 9h à 17h</li>
              <li>Lieu : Service de restauration - BNRM</li>
              <li>Documents à apporter : Votre pièce d'identité et ce numéro de demande</li>
            </ul>
            <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'quote_accepted':
      return {
        subject: `Devis accepté - Lien de paiement - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Devis accepté - Paiement en attente</h2>
            <p>Bonjour,</p>
            <p>Votre acceptation du devis a bien été enregistrée. Vous pouvez maintenant procéder au paiement.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
              ${quoteAmount ? `<p><strong>Montant à régler :</strong> ${quoteAmount} DH</p>` : ''}
            </div>
            ${paymentUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" 
                 style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Procéder au paiement
              </a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #666;">
              Ou copiez ce lien dans votre navigateur :<br>
              <a href="${paymentUrl}" style="color: #2c5aa0;">${paymentUrl}</a>
            </p>
            ` : '<p>Vous recevrez prochainement les informations de paiement.</p>'}
            <p>Une fois le paiement effectué, les travaux de restauration pourront commencer.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'quote_rejected':
      return {
        subject: `Devis refusé - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Devis refusé</h2>
            <p>Bonjour,</p>
            <p>Votre refus du devis a bien été enregistré.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            ${additionalInfo ? `<p><strong>Raison du refus :</strong> ${additionalInfo}</p>` : ''}
            <p>Votre demande a été clôturée. Vous pouvez soumettre une nouvelle demande à tout moment.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'payment_confirmed':
      return {
        subject: `Paiement confirmé - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Paiement confirmé</h2>
            <p>Bonjour,</p>
            <p>Votre paiement a été confirmé. Les travaux de restauration vont débuter.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <p>Vous serez informé de l'avancement des travaux.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'restoration_started':
      return {
        subject: `Restauration démarrée - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Restauration en cours</h2>
            <p>Bonjour,</p>
            <p>Les travaux de restauration de votre manuscrit ont débuté.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <p>Vous serez informé dès que les travaux seront terminés.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'restoration_completed':
      return {
        subject: `Restauration terminée - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Restauration terminée</h2>
            <p>Bonjour,</p>
            <p>Les travaux de restauration de votre manuscrit sont terminés.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <p>Votre manuscrit est prêt à être restitué. Nous vous contacterons pour organiser la récupération.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    case 'artwork_ready':
      return {
        subject: `Œuvre prête à être récupérée - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Œuvre prête</h2>
            <p>Bonjour,</p>
            <p>Votre manuscrit restauré est disponible et prêt à être récupéré.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            ${additionalInfo ? `<p>${additionalInfo}</p>` : ''}
            <p>Veuillez contacter notre service pour organiser la récupération.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
    
    default:
      return {
        subject: `Notification - ${requestNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Mise à jour de votre demande</h2>
            <p>Bonjour,</p>
            <p>Une mise à jour concernant votre demande de restauration.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Numéro de demande :</strong> ${requestNumber}</p>
              <p><strong>Manuscrit :</strong> ${manuscriptTitle}</p>
            </div>
            <p>Consultez votre espace personnel pour plus de détails.</p>
            <p>Cordialement,<br>L'équipe de restauration - BNRM</p>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notification: NotificationRequest = await req.json();
    console.log('Processing restoration notification:', notification);

    // Créer la notification dans la base de données
    const { error: notifError } = await supabase
      .from('restoration_notifications')
      .insert({
        request_id: notification.requestId,
        recipient_id: notification.recipientId,
        notification_type: notification.notificationType,
        title: getEmailContent(notification).subject,
        message: `Mise à jour concernant votre demande ${notification.requestNumber}`,
        is_read: false
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    const emailContent = getEmailContent(notification);
    console.log('Email notification ready:', {
      to: notification.recipientEmail,
      subject: emailContent.subject
    });

    // Envoyer l'email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const emailResult = await resend.emails.send({
          from: "BNRM Restauration <noreply@resend.dev>",
          to: [notification.recipientEmail],
          subject: emailContent.subject,
          html: emailContent.html,
        });
        console.log('Email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Ne pas bloquer si l'email échoue
      }
    } else {
      console.warn('RESEND_API_KEY not configured, email not sent');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification créée et email envoyé avec succès' 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-restoration-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
