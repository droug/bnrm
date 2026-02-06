import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArbitrationRequest {
  request_id: string;
  reason: string;
  requested_by_name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_id, reason, requested_by_name }: ArbitrationRequest = await req.json();

    console.log("[ARBITRATION] Processing arbitration request for:", request_id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les détails de la demande de dépôt légal
    const { data: depositRequest, error: depositError } = await supabaseAdmin
      .from("legal_deposit_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (depositError || !depositRequest) {
      throw new Error("Demande de dépôt légal non trouvée");
    }

    // Récupérer les utilisateurs avec le rôle "validateur"
    const { data: validatorRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "validateur");

    if (rolesError) {
      console.error("[ARBITRATION] Error fetching validators:", rolesError);
      throw new Error("Erreur lors de la récupération des validateurs");
    }

    if (!validatorRoles || validatorRoles.length === 0) {
      console.warn("[ARBITRATION] No validators found with 'validateur' role");
      throw new Error("Aucun validateur configuré dans le système");
    }

    const validatorIds = validatorRoles.map(r => r.user_id);
    console.log(`[ARBITRATION] Found ${validatorIds.length} validators`);

    // Récupérer les emails des validateurs
    const { data: validatorProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", validatorIds);

    if (profilesError) {
      console.error("[ARBITRATION] Error fetching validator profiles:", profilesError);
    }

    // Récupérer les emails depuis auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("[ARBITRATION] Error fetching auth users:", authError);
      throw new Error("Erreur lors de la récupération des utilisateurs");
    }

    const validatorEmails = authUsers.users
      .filter(u => validatorIds.includes(u.id))
      .map(u => u.email)
      .filter(Boolean) as string[];

    console.log(`[ARBITRATION] Sending notifications to ${validatorEmails.length} validators`);

    // Mettre à jour la demande avec les informations d'arbitrage
    const { error: updateError } = await supabaseAdmin
      .from("legal_deposit_requests")
      .update({
        arbitration_requested: true,
        arbitration_requested_at: new Date().toISOString(),
        arbitration_reason: reason,
        arbitration_status: "pending"
      })
      .eq("id", request_id);

    if (updateError) {
      console.error("[ARBITRATION] Error updating request:", updateError);
      throw new Error("Erreur lors de la mise à jour de la demande");
    }

    // Générer le lien vers la page de validation
    const siteUrl = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";
    const arbitrationLink = `${siteUrl}/admin/depot-legal?arbitration=${request_id}`;

    // Créer les notifications système pour chaque validateur
    const systemNotifications = validatorIds.map(userId => ({
      user_id: userId,
      type: "arbitrage_depot_legal",
      type_code: "ARBITRAGE_DL",
      title: `Demande d'arbitrage - ${depositRequest.request_number}`,
      message: `Une demande d'arbitrage a été soumise pour la demande de dépôt légal "${depositRequest.title}". Motif: ${reason}`,
      short_message: `Arbitrage requis: ${depositRequest.request_number}`,
      category: "legal_deposit",
      module: "depot_legal",
      priority: 1,
      requires_action: true,
      action_url: arbitrationLink,
      action_label: "Traiter l'arbitrage",
      is_read: false,
      source_table: "legal_deposit_requests",
      source_record_id: request_id
    }));

    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert(systemNotifications);

    if (notifError) {
      console.error("[ARBITRATION] Error creating system notifications:", notifError);
    } else {
      console.log(`[ARBITRATION] Created ${systemNotifications.length} system notifications`);
    }

    // Envoyer les emails
    const emailHtml = getArbitrationEmailHtml(
      depositRequest,
      reason,
      requested_by_name,
      arbitrationLink
    );

    let emailsSent = 0;
    for (const email of validatorEmails) {
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: `⚖️ Demande d'arbitrage - Dépôt Légal ${depositRequest.request_number}`,
          html: emailHtml
        });

        if (emailResult.success) {
          emailsSent++;
          console.log(`[ARBITRATION] Email sent to ${email}`);
        } else {
          console.warn(`[ARBITRATION] Failed to send email to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`[ARBITRATION] Error sending email to ${email}:`, emailError);
      }
    }

    console.log(`[ARBITRATION] Arbitration request completed. Emails sent: ${emailsSent}/${validatorEmails.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demande d'arbitrage envoyée avec succès",
        validators_notified: validatorIds.length,
        emails_sent: emailsSent,
        system_notifications_created: systemNotifications.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[ARBITRATION] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erreur interne du serveur",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getArbitrationEmailHtml(
  depositRequest: any,
  reason: string,
  requestedByName: string,
  arbitrationLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .reason-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-left: 4px solid #d97706; border-radius: 4px; }
        .action-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: bold;
          margin: 20px 0;
        }
        .badge { 
          display: inline-block; 
          background: #f59e0b; 
          color: white; 
          padding: 5px 15px; 
          border-radius: 20px; 
          font-size: 14px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚖️ Demande d'Arbitrage</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Dépôt Légal - BNRM</p>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          
          <p>Une demande d'arbitrage a été soumise et requiert votre attention en tant que <strong>Validateur</strong>.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1e3a5f;">📋 Informations de la demande</h3>
            <p><strong>Numéro de demande:</strong> ${depositRequest.request_number}</p>
            <p><strong>Titre:</strong> ${depositRequest.title || 'Non spécifié'}</p>
            <p><strong>Type de support:</strong> ${depositRequest.support_type || 'Non spécifié'}</p>
            <p><strong>Auteur:</strong> ${depositRequest.author_name || 'Non spécifié'}</p>
            <p><strong>Date de dépôt:</strong> ${new Date(depositRequest.created_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div class="reason-box">
            <h3 style="margin-top: 0; color: #d97706;">📝 Motif de l'arbitrage</h3>
            <p>${reason}</p>
            <p style="margin-bottom: 0; font-size: 14px; color: #666;">
              <em>Demandé par: ${requestedByName}</em>
            </p>
          </div>
          
          <p>En tant que Validateur, vous êtes invité à:</p>
          <ul>
            <li>Examiner les détails de la demande</li>
            <li>Analyser le motif de l'arbitrage</li>
            <li>Prendre une décision: <strong>Approuver</strong> ou <strong>Rejeter</strong> avec motif</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${arbitrationLink}" class="action-button">
              Traiter la demande d'arbitrage
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 13px;">
            Lien de secours: <a href="${arbitrationLink}" style="color: #1e3a5f;">${arbitrationLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>Bibliothèque Nationale du Royaume du Maroc<br>
          Avenue Ibn Khaldoun, Rabat, Maroc<br>
          Tél: +212 537 77 18 33 | Email: contact@bnrm.ma</p>
          <p style="color: #999; font-size: 11px;">
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
