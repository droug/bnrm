import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper pour obtenir l'URL du site de manière cohérente
function resolvePublicSiteUrl(): string {
  const raw = Deno.env.get("SITE_URL") || Deno.env.get("PUBLIC_SITE_URL") || "https://bnrm-dev.digiup.ma";
  return raw.trim().replace(/\/$/, "");
}

interface NotificationRequest {
  partyId: string;
  requestId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partyId, requestId }: NotificationRequest = await req.json();

    console.log(`[NOTIFY-PARTY] Processing partyId: ${partyId}, requestId: ${requestId}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les informations de la partie
    const { data: party, error: partyError } = await supabaseAdmin
      .from("legal_deposit_parties")
      .select(`
        *,
        request:legal_deposit_requests(request_number, title),
        user:profiles(first_name, last_name, email)
      `)
      .eq("id", partyId)
      .single();

    if (partyError) throw partyError;

    // Récupérer l'email de l'utilisateur depuis auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      party.user_id
    );

    if (authError) throw authError;

    const userEmail = authData.user.email;
    const userName = party.user?.first_name && party.user?.last_name 
      ? `${party.user.first_name} ${party.user.last_name}` 
      : userEmail;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    const roleLabels: { [key: string]: string } = {
      editor: "Éditeur",
      printer: "Imprimeur",
      producer: "Producteur",
    };

    const roleLabel = roleLabels[party.party_role] || party.party_role;

    // Créer une notification dans la base de données
    await supabaseAdmin.from("deposit_notifications").insert({
      request_id: requestId,
      recipient_id: party.user_id,
      notification_type: "party_invitation",
      title: "Nouvelle demande de dépôt légal",
      message: `Vous avez été invité en tant que ${roleLabel} pour la demande de dépôt légal "${party.request.title}" (${party.request.request_number}).`,
    });

    // Préparer l'email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #002B45; border-radius: 4px; }
          .btn { display: inline-block; padding: 12px 30px; background: #002B45; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${userName},</h2>
            
            <p>Vous avez été désigné en tant que <strong>${roleLabel}</strong> pour une nouvelle demande de dépôt légal.</p>
            
            <div class="info-box">
              <p><strong>Titre de l'œuvre:</strong> ${party.request.title}</p>
              <p><strong>Numéro de demande:</strong> ${party.request.request_number}</p>
              <p><strong>Votre rôle:</strong> ${roleLabel}</p>
            </div>
            
            <p>Veuillez vous connecter à votre espace personnel pour consulter et valider cette demande.</p>
            
            <p style="text-align: center;">
              <a href="${resolvePublicSiteUrl()}/my-space" class="btn">Accéder à mon espace</a>
            </p>
            
            <p>Cordialement,<br><strong>L'équipe du Dépôt Légal - BNRM</strong></p>
          </div>
          <div class="footer">
            <p>Bibliothèque Nationale du Royaume du Maroc<br>
            Avenue Ibn Khaldoun, Rabat, Maroc<br>
            Tél: +212 537 77 18 33 | Email: depot.legal@bnrm.ma</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Utiliser le client SMTP unifié
    const emailResult = await sendEmail({
      to: userEmail,
      subject: `Invitation Dépôt Légal - ${party.request.request_number}`,
      html: emailHtml,
    });

    if (emailResult.success) {
      console.log(`[NOTIFY-PARTY] Email sent successfully via ${emailResult.method} to ${userEmail}`);
    } else {
      console.warn(`[NOTIFY-PARTY] Email failed: ${emailResult.error}`);
    }

    // Mettre à jour la date de notification
    await supabaseAdmin
      .from("legal_deposit_parties")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", partyId);

    console.log(`[NOTIFY-PARTY] Notification sent to ${userEmail} for party ${partyId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent successfully",
        emailSent: emailResult.success,
        method: emailResult.method,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[NOTIFY-PARTY] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
