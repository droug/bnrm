import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AttributionNotificationRequest {
  requestId: string;
  attributedNumbers?: {
    isbn?: string;
    issn?: string;
    dlNumber?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, attributedNumbers }: AttributionNotificationRequest = await req.json();

    console.log(`[NOTIFY-ATTRIBUTION] Processing request: ${requestId}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les informations de la demande
    const { data: request, error: requestError } = await supabaseAdmin
      .from("legal_deposit_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError) {
      console.error("[NOTIFY-ATTRIBUTION] Error fetching request:", requestError);
      throw requestError;
    }

    if (!request) {
      throw new Error("Request not found");
    }

    // Récupérer l'email de l'utilisateur
    const userId = request.initiator_id;
    let userEmail: string | null = null;
    let userName: string = "Utilisateur";

    // Essayer d'abord de récupérer depuis auth.users si initiator_id existe
    if (userId) {
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!authError && authData?.user?.email) {
          userEmail = authData.user.email;
          
          // Récupérer le profil utilisateur pour le nom
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", userId)
            .single();

          if (profile?.first_name && profile?.last_name) {
            userName = `${profile.first_name} ${profile.last_name}`;
          }
        }
      } catch (err) {
        console.warn("[NOTIFY-ATTRIBUTION] Could not fetch user from auth:", err);
      }
    }

    // Fallback: récupérer l'email depuis les metadata de la demande
    if (!userEmail) {
      const metadata = request.metadata as any;
      if (metadata?.customFields?.author_email) {
        userEmail = metadata.customFields.author_email;
        userName = metadata.customFields.author_name || "Utilisateur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from metadata:", userEmail);
      }
    }

    if (!userEmail) {
      console.warn("[NOTIFY-ATTRIBUTION] No email found for request:", requestId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No recipient email found - notification skipped",
          requestId
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[NOTIFY-ATTRIBUTION] Sending to ${userEmail} for request ${request.request_number}`);

    // Construire la liste des numéros attribués
    const numbers = attributedNumbers || {};
    let numbersHtml = '';
    
    if (numbers.isbn || request.isbn_assigned) {
      numbersHtml += `<p><strong>ISBN:</strong> ${numbers.isbn || request.isbn_assigned}</p>`;
    }
    if (numbers.issn || request.issn_assigned) {
      numbersHtml += `<p><strong>ISSN:</strong> ${numbers.issn || request.issn_assigned}</p>`;
    }
    if (numbers.dlNumber || request.dl_number) {
      numbersHtml += `<p><strong>Numéro de Dépôt Légal:</strong> ${numbers.dlNumber || request.dl_number}</p>`;
    }

    if (!numbersHtml) {
      numbersHtml = '<p>Les numéros d\'identification seront communiqués ultérieurement.</p>';
    }

    // Créer une notification dans la base de données (seulement si userId existe)
    if (userId) {
      await supabaseAdmin.from("deposit_notifications").insert({
        request_id: requestId,
        recipient_id: userId,
        notification_type: "attribution",
        title: "Attribution de numéros - Dépôt Légal",
        message: `Votre demande de dépôt légal "${request.title}" (${request.request_number}) a été validée et les numéros ont été attribués.`,
      });
    }

    // Envoyer l'email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #002B45; border-radius: 4px; }
            .numbers-box { background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 4px; }
            .numbers-box p { margin: 8px 0; }
            .btn { display: inline-block; padding: 12px 30px; background: #002B45; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .next-steps { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #ffc107; }
            .next-steps h4 { margin: 0 0 10px 0; color: #856404; }
            .next-steps ul { margin: 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Département du Dépôt Légal</p>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="success-badge">✓ DEMANDE VALIDÉE</span>
              </div>
              
              <h2>Félicitations ${userName} !</h2>
              
              <p>Nous avons le plaisir de vous informer que votre demande de dépôt légal a été <strong>validée</strong> et que les numéros d'identification ont été attribués à votre œuvre.</p>
              
              <div class="info-box">
                <p><strong>Titre de l'œuvre:</strong> ${request.title}</p>
                ${request.subtitle ? `<p><strong>Sous-titre:</strong> ${request.subtitle}</p>` : ''}
                <p><strong>Numéro de demande:</strong> ${request.request_number}</p>
                <p><strong>Type de support:</strong> ${request.support_type}</p>
              </div>
              
              <div class="numbers-box">
                <h3 style="margin: 0 0 15px 0; color: #10b981;">Numéros attribués</h3>
                ${numbersHtml}
              </div>
              
              <div class="next-steps">
                <h4>Prochaines étapes</h4>
                <ul>
                  <li>Téléchargez votre accusé de réception depuis votre espace personnel</li>
                  <li>Déposez les exemplaires requis à la BNRM dans un délai de 30 jours</li>
                  <li>Conservez précieusement les numéros attribués pour vos publications</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="https://www.bnrm.ma/my-space" class="btn">Accéder à mon espace</a>
              </p>
              
              <p>Pour toute question, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br><strong>L'équipe du Dépôt Légal - BNRM</strong></p>
            </div>
            <div class="footer">
              <p>Bibliothèque Nationale du Royaume du Maroc<br>
              Avenue Ibn Khaldoun, Rabat, Maroc<br>
              Tél: +212 537 77 18 33 | Email: depot.legal@bnrm.ma</p>
              <p style="margin-top: 10px; font-size: 11px; color: #999;">
                Ce message a été envoyé automatiquement. Merci de ne pas y répondre directement.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await resend.emails.send({
        from: "BNRM Dépôt Légal <onboarding@resend.dev>",
        to: [userEmail],
        subject: `Attribution Dépôt Légal - ${request.request_number} - Demande Validée`,
        html: emailHtml,
      });

      if (emailResult.error) {
        console.error(`[NOTIFY-ATTRIBUTION] Email error:`, emailResult.error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Email non envoyé: ${emailResult.error.message}`,
            error: emailResult.error,
            recipient: userEmail
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`[NOTIFY-ATTRIBUTION] Email sent successfully to ${userEmail}:`, emailResult);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: true,
          message: "Notification envoyée avec succès",
          recipient: userEmail
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.warn("[NOTIFY-ATTRIBUTION] RESEND_API_KEY not configured, email not sent");
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: false,
          message: "Notification enregistrée (email non configuré)",
          recipient: userEmail
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("[NOTIFY-ATTRIBUTION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
