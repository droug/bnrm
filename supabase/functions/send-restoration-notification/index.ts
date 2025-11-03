import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  additionalData?: any;
}

const getEmailContent = (type: string, data: any) => {
  const baseUrl = Deno.env.get("SUPABASE_URL")?.replace("https://", "https://") || "";
  const frontendUrl = baseUrl.replace(".supabase.co", ".lovable.app") || "http://localhost:8080";
  
  switch (type) {
    case 'request_received':
      return {
        subject: `Demande de restauration reçue - ${data.requestNumber}`,
        html: `
          <h2>Demande de restauration enregistrée</h2>
          <p>Bonjour,</p>
          <p>Votre demande de restauration a bien été enregistrée.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p>Vous serez notifié de l'avancement de votre demande par e-mail et dans votre espace personnel.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Suivre ma demande</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'request_authorized':
      return {
        subject: `Demande de restauration autorisée - ${data.requestNumber}`,
        html: `
          <h2>Demande de restauration autorisée</h2>
          <p>Bonjour,</p>
          <p>Bonne nouvelle ! Votre demande de restauration a été autorisée par la direction.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p>Prochaine étape : Diagnostic de l'œuvre.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'request_rejected':
      return {
        subject: `Demande de restauration refusée - ${data.requestNumber}`,
        html: `
          <h2>Demande de restauration refusée</h2>
          <p>Bonjour,</p>
          <p>Nous vous informons que votre demande de restauration n'a pas pu être acceptée.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Motif :</strong> ${data.rejectionReason || 'Non spécifié'}</p>
          <p>Pour plus d'informations, veuillez nous contacter.</p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'provide_artwork':
      return {
        subject: `Veuillez fournir l'œuvre - ${data.requestNumber}`,
        html: `
          <h2>Fourniture de l'œuvre requise</h2>
          <p>Bonjour,</p>
          <p>Le diagnostic de votre œuvre est prêt à être réalisé. Nous vous prions de bien vouloir fournir l'œuvre suivante :</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Instructions :</strong> ${data.instructions || 'Veuillez apporter l\'œuvre à notre atelier de restauration.'}</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'quote_sent':
      return {
        subject: `Devis de restauration - ${data.requestNumber}`,
        html: `
          <h2>Devis de restauration disponible</h2>
          <p>Bonjour,</p>
          <p>Le devis pour la restauration de votre œuvre est maintenant disponible.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Montant du devis :</strong> ${data.quoteAmount} DH</p>
          <p>Veuillez consulter et accepter le devis dans votre espace personnel pour que nous puissions procéder à la restauration.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir et accepter le devis</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'quote_accepted':
      return {
        subject: `Devis accepté - ${data.requestNumber}`,
        html: `
          <h2>Devis accepté</h2>
          <p>Bonjour,</p>
          <p>Nous avons bien reçu votre acceptation du devis.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Montant :</strong> ${data.quoteAmount} DH</p>
          <p>Vous recevrez prochainement un lien pour effectuer le paiement.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Suivre ma demande</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'quote_rejected':
      return {
        subject: `Devis refusé - ${data.requestNumber}`,
        html: `
          <h2>Devis refusé</h2>
          <p>Bonjour,</p>
          <p>Nous avons bien pris en compte votre refus du devis de restauration.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p>Votre demande a été clôturée. N'hésitez pas à nous contacter si vous souhaitez discuter d'autres options.</p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'payment_link':
      return {
        subject: `Lien de paiement - Restauration ${data.requestNumber}`,
        html: `
          <h2>Paiement de la restauration</h2>
          <p>Bonjour,</p>
          <p>Votre devis a été accepté. Voici le lien pour procéder au paiement :</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Montant à payer :</strong> ${data.quoteAmount} DH</p>
          <p><a href="${data.paymentLink || frontendUrl + '/my-library-space'}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Procéder au paiement</a></p>
          <p>Une fois le paiement effectué, nous commencerons la restauration de votre œuvre.</p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'restoration_started':
      return {
        subject: `Restauration en cours - ${data.requestNumber}`,
        html: `
          <h2>Restauration de votre œuvre commencée</h2>
          <p>Bonjour,</p>
          <p>Nous avons le plaisir de vous informer que la restauration de votre œuvre a commencé.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Durée estimée :</strong> ${data.estimatedDuration || 'À déterminer'} jours</p>
          <p>Vous serez informé de l'avancement des travaux.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Suivre l'avancement</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'restoration_completed':
      return {
        subject: `Restauration terminée - ${data.requestNumber}`,
        html: `
          <h2>Restauration de votre œuvre terminée</h2>
          <p>Bonjour,</p>
          <p>Excellente nouvelle ! La restauration de votre œuvre est terminée.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p>Un rapport détaillé de la restauration est disponible dans votre espace personnel.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Consulter le rapport</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    case 'artwork_ready':
      return {
        subject: `Œuvre prête pour retrait - ${data.requestNumber}`,
        html: `
          <h2>Votre œuvre restaurée est prête</h2>
          <p>Bonjour,</p>
          <p>Votre œuvre restaurée est maintenant prête à être retirée.</p>
          <p><strong>Numéro de demande :</strong> ${data.requestNumber}</p>
          <p><strong>Manuscrit :</strong> ${data.manuscriptTitle}</p>
          <p><strong>Lieu de retrait :</strong> Atelier de restauration de la bibliothèque</p>
          <p><strong>Horaires :</strong> Lundi-Vendredi, 9h-17h</p>
          <p>Veuillez vous munir d'une pièce d'identité lors du retrait.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
    
    default:
      return {
        subject: `Notification - ${data.requestNumber}`,
        html: `
          <h2>Mise à jour de votre demande</h2>
          <p>Bonjour,</p>
          <p>Il y a une mise à jour concernant votre demande de restauration ${data.requestNumber}.</p>
          <p><a href="${frontendUrl}/my-library-space" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir les détails</a></p>
          <p>Cordialement,<br>L'équipe de restauration</p>
        `
      };
  }
};

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
    const requestData: NotificationRequest = await req.json();
    console.log(`[RESTORATION-NOTIFICATION] Type: ${requestData.notificationType}, Request: ${requestData.requestNumber}`);

    // Préparer les données pour l'email
    const emailData = {
      requestNumber: requestData.requestNumber,
      manuscriptTitle: requestData.manuscriptTitle,
      ...requestData.additionalData
    };

    const { subject, html } = getEmailContent(requestData.notificationType, emailData);

    // Créer la notification dans la base de données
    const { data: notification, error: dbError } = await supabaseClient
      .from('restoration_notifications')
      .insert({
        request_id: requestData.requestId,
        recipient_id: requestData.recipientId,
        notification_type: requestData.notificationType,
        title: subject,
        message: html.replace(/<[^>]*>/g, '').substring(0, 200) + '...' // Version texte courte
      })
      .select()
      .single();

    if (dbError) {
      console.error('[RESTORATION-NOTIFICATION] DB Error:', dbError);
      throw dbError;
    }

    // Envoyer l'email
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Bibliothèque Nationale <onboarding@resend.dev>',
        to: [requestData.recipientEmail],
        subject: subject,
        html: html,
      });

      if (emailError) {
        console.error('[RESTORATION-NOTIFICATION] Email Error:', emailError);
        // Ne pas échouer si l'email ne peut pas être envoyé
      } else {
        console.log('[RESTORATION-NOTIFICATION] Email sent:', emailData);
      }
    } catch (emailError) {
      console.error('[RESTORATION-NOTIFICATION] Email send failed:', emailError);
      // Continue même si l'email échoue
    }

    return new Response(JSON.stringify({ 
      success: true, 
      notification,
      message: 'Notification créée avec succès'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('[RESTORATION-NOTIFICATION] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
