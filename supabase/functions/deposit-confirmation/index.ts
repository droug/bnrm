import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  action: "create_tokens" | "confirm" | "reject" | "resend" | "get_status";
  request_id?: string;
  token?: string;
  rejection_reason?: string;
  editor_email?: string;
  editor_name?: string;
  printer_email?: string;
  printer_name?: string;
  deposit_type?: string;
  title?: string;
  initiator_type?: "editor" | "printer";
}

// Helper to get the public site URL consistently
function resolvePublicSiteUrl(): string {
  const raw =
    Deno.env.get("SITE_URL") ||
    Deno.env.get("PUBLIC_SITE_URL") ||
    "https://bnrm-dev.digiup.ma";

  const trimmed = raw.trim().replace(/\/$/, "");

  try {
    const url = new URL(trimmed);

    const protocolOk = url.protocol === "https:" || url.protocol === "http:";
    const hostOk = url.hostname.includes(".") && !url.hostname.includes("@");
    const credsOk = !url.username && !url.password;

    if (!protocolOk || !hostOk || !credsOk) throw new Error("Invalid site URL");

    // Keep only the origin (no path/query) to avoid malformed links.
    return url.origin;
  } catch {
    console.warn(
      `[DEPOSIT-CONFIRMATION] Invalid SITE_URL/PUBLIC_SITE_URL ('${trimmed}'), falling back to https://bnrm-dev.digiup.ma`
    );
    return "https://bnrm-dev.digiup.ma";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ConfirmationRequest = await req.json();
    console.log(`[DEPOSIT-CONFIRMATION] Action: ${body.action}`);

    // === ACTION: CREATE TOKENS ===
    if (body.action === "create_tokens") {
      const { request_id, editor_email, editor_name, printer_email, printer_name, deposit_type, title, initiator_type } = body;

      if (!request_id || !editor_email || !printer_email) {
        return new Response(
          JSON.stringify({ success: false, error: "request_id, editor_email et printer_email sont requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Vérifier si des tokens existent déjà
      const { data: existingTokens } = await supabase
        .from("deposit_confirmation_tokens")
        .select("*")
        .eq("request_id", request_id);

      if (existingTokens && existingTokens.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Des tokens de confirmation existent déjà pour cette demande" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Chercher si les utilisateurs ont des comptes
      const { data: editorUser } = await supabase.auth.admin.listUsers();
      const editorAccount = editorUser?.users?.find(u => u.email?.toLowerCase() === editor_email.toLowerCase());
      const printerAccount = editorUser?.users?.find(u => u.email?.toLowerCase() === printer_email.toLowerCase());

      // Créer les tokens pour les deux parties
      const tokensToCreate = [];
      
      // L'initiateur est automatiquement confirmé
      if (initiator_type === "editor") {
        tokensToCreate.push({
          request_id,
          party_type: "editor",
          email: editor_email,
          status: "confirmed",
          user_id: editorAccount?.id || null,
          confirmed_at: new Date().toISOString(),
        });
        tokensToCreate.push({
          request_id,
          party_type: "printer",
          email: printer_email,
          status: "pending",
          user_id: printerAccount?.id || null,
        });
      } else {
        tokensToCreate.push({
          request_id,
          party_type: "printer",
          email: printer_email,
          status: "confirmed",
          user_id: printerAccount?.id || null,
          confirmed_at: new Date().toISOString(),
        });
        tokensToCreate.push({
          request_id,
          party_type: "editor",
          email: editor_email,
          status: "pending",
          user_id: editorAccount?.id || null,
        });
      }

      const { data: createdTokens, error: insertError } = await supabase
        .from("deposit_confirmation_tokens")
        .insert(tokensToCreate)
        .select();

      if (insertError) {
        console.error("[DEPOSIT-CONFIRMATION] Insert error:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mettre à jour le statut de la demande
      await supabase
        .from("legal_deposit_requests")
        .update({
          confirmation_status: "pending_confirmation",
          editor_confirmed: initiator_type === "editor",
          printer_confirmed: initiator_type === "printer",
          [`${initiator_type}_confirmation_at`]: new Date().toISOString(),
        })
        .eq("id", request_id);

      // Récupérer les détails complets de la demande
      const { data: requestData } = await supabase
        .from("legal_deposit_requests")
        .select("request_number, title, subtitle, author_name, language, page_count, support_type, monograph_type, metadata, publication_date")
        .eq("id", request_id)
        .single();

      // Extraire les infos supplémentaires des métadonnées
      const meta = requestData?.metadata as Record<string, any> || {};
      const authorName = requestData?.author_name || meta?.author_name || meta?.author || '';
      const subtitle = requestData?.subtitle || '';
      const lang = requestData?.language || meta?.language || '';
      const pageCount = requestData?.page_count || meta?.page_count || '';
      const pubDate = requestData?.publication_date || meta?.publication_date || '';
      const supportType = requestData?.support_type || '';
      
      // Map support_type to French label
      const supportTypeLabels: Record<string, string> = {
        'papier': 'Papier', 'numerique': 'Numérique', 'audio': 'Audio', 'video': 'Vidéo',
        'multimedia': 'Multimédia', 'autre': 'Autre'
      };
      const supportLabel = supportTypeLabels[supportType] || supportType;

      // Build extra details rows for emails
      const extraDetailsRows = [
        authorName ? `<tr><td style="padding: 8px 0; color: #718096;">Auteur:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${authorName}</td></tr>` : '',
        subtitle ? `<tr><td style="padding: 8px 0; color: #718096;">Sous-titre:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${subtitle}</td></tr>` : '',
        lang ? `<tr><td style="padding: 8px 0; color: #718096;">Langue:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${lang}</td></tr>` : '',
        supportLabel ? `<tr><td style="padding: 8px 0; color: #718096;">Support:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${supportLabel}</td></tr>` : '',
        pageCount ? `<tr><td style="padding: 8px 0; color: #718096;">Nombre de pages:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${pageCount}</td></tr>` : '',
        pubDate ? `<tr><td style="padding: 8px 0; color: #718096;">Date de publication:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${pubDate}</td></tr>` : '',
        `<tr><td style="padding: 8px 0; color: #718096;">Éditeur:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${editor_name || 'Non spécifié'}</td></tr>`,
        `<tr><td style="padding: 8px 0; color: #718096;">Imprimeur:</td><td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${printer_name || 'Non spécifié'}</td></tr>`,
      ].filter(Boolean).join('\n                    ');

      // Envoyer l'email à la partie non-initiatrice
      const pendingToken = createdTokens?.find(t => t.status === "pending");
      if (pendingToken) {
        const siteUrl = resolvePublicSiteUrl();
        const confirmUrl = `${siteUrl}/confirm-deposit/${pendingToken.token}`;
        console.log("[DEPOSIT-CONFIRMATION] Confirmation link:", confirmUrl);
        const partyName = pendingToken.party_type === "editor" ? editor_name : printer_name;
        const partyTypeFr = pendingToken.party_type === "editor" ? "Éditeur" : "Imprimeur";
        const initiatorTypeFr = initiator_type === "editor" ? "l'éditeur" : "l'imprimeur";

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ BNRM - Dépôt Légal</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0;">Demande de Confirmation</p>
              </div>
              
              <div style="padding: 30px;">
                <p style="color: #2d3748; font-size: 16px;">Bonjour ${partyName || partyTypeFr},</p>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Une demande de dépôt légal a été initiée par ${initiatorTypeFr} et nécessite votre confirmation en tant que <strong>${partyTypeFr}</strong>.
                </p>
                
                <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px;">📋 Détails de la demande</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">N° de demande:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${requestData?.request_number || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Titre:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${title || "Non spécifié"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Type:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${deposit_type || "Dépôt légal"}</td>
                    </tr>
                    ${extraDetailsRows}
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Délai de confirmation:</td>
                      <td style="padding: 8px 0; color: #e53e3e; font-weight: 600;">15 jours</td>
                    </tr>
                  </table>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Pour confirmer votre participation à cette demande de dépôt légal, veuillez cliquer sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    ✅ Confirmer ma participation
                  </a>
                </div>
                
                <p style="color: #718096; font-size: 14px; text-align: center;">
                  Ou copiez ce lien dans votre navigateur :<br>
                  <a href="${confirmUrl}" style="color: #3182ce; word-break: break-all;">${confirmUrl}</a>
                </p>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #744210; margin: 0; font-size: 14px;">
                    <strong>⚠️ Important:</strong> Ce lien expire dans 15 jours. Sans confirmation des deux parties, la demande ne sera pas transmise à la BNRM.
                  </p>
                </div>
              </div>
              
              <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc<br>
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResult = await sendEmail({
          to: pendingToken.email,
          subject: `[BNRM] Confirmation requise - Dépôt Légal ${requestData?.request_number || ""}`,
          html: emailHtml,
        });

        console.log(`[DEPOSIT-CONFIRMATION] Email sent to ${pendingToken.email}:`, emailResult);
      }

      // Envoyer un email d'accusé de réception à l'initiateur
      const confirmedToken = createdTokens?.find(t => t.status === "confirmed");
      if (confirmedToken) {
        const initiatorName = confirmedToken.party_type === "editor" ? editor_name : printer_name;
        const initiatorTypeFr = confirmedToken.party_type === "editor" ? "Éditeur" : "Imprimeur";
        const pendingPartyTypeFr = confirmedToken.party_type === "editor" ? "l'imprimeur" : "l'éditeur";

        const ackEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ BNRM - Dépôt Légal</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0;">Accusé de Réception</p>
              </div>
              
              <div style="padding: 30px;">
                <p style="color: #2d3748; font-size: 16px;">Bonjour ${initiatorName || initiatorTypeFr},</p>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Votre demande de dépôt légal a été enregistrée avec succès. En tant qu'initiateur (${initiatorTypeFr}), votre confirmation a été automatiquement validée.
                </p>
                
                <div style="background-color: #c6f6d5; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #276749; margin: 0; font-size: 14px;">
                    <strong>✅ Votre confirmation :</strong> Validée automatiquement
                  </p>
                </div>
                
                <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px;">📋 Détails de la demande</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">N° de demande:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${requestData?.request_number || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Titre:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${title || "Non spécifié"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Type:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${deposit_type || "Dépôt légal"}</td>
                    </tr>
                    ${extraDetailsRows}
                  </table>
                </div>
                
                <div style="background-color: #fef3c7; border-left: 4px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #744210; margin: 0; font-size: 14px;">
                    <strong>⏳ En attente :</strong> La confirmation de ${pendingPartyTypeFr} est requise pour que votre demande soit transmise à la BNRM. Un délai de 15 jours est accordé.
                  </p>
                </div>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Vous recevrez une notification dès que ${pendingPartyTypeFr} aura confirmé sa participation.
                </p>
              </div>
              
              <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc<br>
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        const ackEmailResult = await sendEmail({
          to: confirmedToken.email,
          subject: `[BNRM] Accusé de réception - Dépôt Légal ${requestData?.request_number || ""}`,
          html: ackEmailHtml,
        });

        console.log(`[DEPOSIT-CONFIRMATION] Acknowledgment email sent to initiator ${confirmedToken.email}:`, ackEmailResult);
      }

      // === NOTIFICATION AUTEUR ===
      // Extraire l'email de l'auteur depuis les métadonnées
      const authorEmail = meta?.customFields?.author_email || meta?.author_email || '';
      const authorFullName = authorName || meta?.customFields?.author_name || requestData?.author_name || '';
      
      if (authorEmail && authorEmail !== editor_email && authorEmail !== printer_email) {
        console.log(`[DEPOSIT-CONFIRMATION] Sending author notification to: ${authorEmail}`);
        
        const siteUrl = resolvePublicSiteUrl();
        const authorEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ BNRM - Dépôt Légal</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0;">Notification à l'Auteur</p>
              </div>
              
              <div style="padding: 30px;">
                <p style="color: #2d3748; font-size: 16px;">Bonjour ${authorFullName || 'Cher(e) Auteur'},</p>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Nous vous informons qu'une demande de dépôt légal a été initiée pour votre œuvre. Voici les détails :
                </p>
                
                <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px;">📋 Détails de la demande</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">N° de demande:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${requestData?.request_number || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Titre:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${title || "Non spécifié"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Type:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${deposit_type || "Dépôt légal"}</td>
                    </tr>
                    ${extraDetailsRows}
                  </table>
                </div>
                
                <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #2a4365; margin: 0; font-size: 14px;">
                    <strong>ℹ️ Information:</strong> La demande est en attente de confirmation des deux parties (éditeur et imprimeur). Vous serez notifié(e) de l'avancement du dossier.
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${siteUrl}/my-space" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    📂 Accéder à Mon Espace
                  </a>
                </div>
              </div>
              
              <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc<br>
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        const authorEmailResult = await sendEmail({
          to: authorEmail,
          subject: `[BNRM] Dépôt Légal - Votre œuvre "${title || 'Sans titre'}" - ${requestData?.request_number || ""}`,
          html: authorEmailHtml,
        });

        console.log(`[DEPOSIT-CONFIRMATION] Author notification sent to ${authorEmail}:`, authorEmailResult);
      } else {
        console.log(`[DEPOSIT-CONFIRMATION] No author email found or author is same as editor/printer, skipping author notification`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Tokens créés et email de confirmation envoyé",
          tokens: createdTokens 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ACTION: CONFIRM ===
    if (body.action === "confirm") {
      const { token } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "Token requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Récupérer le token
      const { data: tokenData, error: tokenError } = await supabase
        .from("deposit_confirmation_tokens")
        .select("*, legal_deposit_requests(request_number, title)")
        .eq("token", token)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ success: false, error: "Token invalide ou non trouvé" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (tokenData.status === "confirmed") {
        return new Response(
          JSON.stringify({ success: true, message: "Déjà confirmé", already_confirmed: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (tokenData.status === "rejected") {
        return new Response(
          JSON.stringify({ success: false, error: "Cette demande a été refusée" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        await supabase
          .from("deposit_confirmation_tokens")
          .update({ status: "expired" })
          .eq("id", tokenData.id);

        return new Response(
          JSON.stringify({ success: false, error: "Ce lien de confirmation a expiré" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Confirmer le token
      // Extract first IP from x-forwarded-for (can contain multiple IPs separated by comma)
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ipAddress = forwardedFor 
        ? forwardedFor.split(",")[0].trim() 
        : (req.headers.get("x-real-ip") || null);
      
      const { error: updateError } = await supabase
        .from("deposit_confirmation_tokens")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: req.headers.get("user-agent"),
        })
        .eq("id", tokenData.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mettre à jour la demande
      const updateField = tokenData.party_type === "editor" 
        ? { editor_confirmed: true, editor_confirmation_at: new Date().toISOString() }
        : { printer_confirmed: true, printer_confirmation_at: new Date().toISOString() };

      await supabase
        .from("legal_deposit_requests")
        .update(updateField)
        .eq("id", tokenData.request_id);

      // Notifier l'initiateur que la contrepartie a confirmé
      const otherPartyToken = await supabase
        .from("deposit_confirmation_tokens")
        .select("email, party_type")
        .eq("request_id", tokenData.request_id)
        .neq("id", tokenData.id)
        .single();

      if (otherPartyToken.data?.email) {
        const siteUrl = resolvePublicSiteUrl();
        const partyTypeFr = tokenData.party_type === "editor" ? "l'éditeur" : "l'imprimeur";
        
        const confirmationEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏛️ BNRM - Dépôt Légal</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0;">Confirmation Réciproque Complète</p>
              </div>
              
              <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <div style="width: 60px; height: 60px; background-color: #48bb78; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 30px;">✓</span>
                  </div>
                </div>
                
                <p style="color: #2d3748; font-size: 16px;">Bonjour,</p>
                
                <p style="color: #4a5568; line-height: 1.6;">
                  Bonne nouvelle ! <strong>${partyTypeFr}</strong> a confirmé sa participation à votre demande de dépôt légal.
                </p>
                
                <div style="background-color: #c6f6d5; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #276749; margin: 0; font-size: 14px;">
                    <strong>✅ Toutes les confirmations ont été reçues !</strong><br>
                    Votre demande sera maintenant transmise à la BNRM pour traitement.
                  </p>
                </div>
                
                <div style="background-color: #edf2f7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #2d3748; margin: 0 0 15px;">📋 Détails de la demande</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">N° de demande:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${tokenData.legal_deposit_requests?.request_number || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #718096;">Titre:</td>
                      <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${tokenData.legal_deposit_requests?.title || "Non spécifié"}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${siteUrl}/my-space" style="display: inline-block; background: linear-gradient(135deg, #38a169 0%, #2f855a 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Suivre ma demande
                  </a>
                </div>
              </div>
              
              <div style="background-color: #edf2f7; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc<br>
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendEmail({
          to: otherPartyToken.data.email,
          subject: `[BNRM] Confirmation reçue - Dépôt Légal ${tokenData.legal_deposit_requests?.request_number || ""}`,
          html: confirmationEmailHtml,
        });

        console.log(`[DEPOSIT-CONFIRMATION] Notification email sent to initiator ${otherPartyToken.data.email}`);
      }

      // Le trigger DB vérifiera si les deux parties ont confirmé et mettra à jour le statut

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Confirmation enregistrée avec succès",
          request_number: tokenData.legal_deposit_requests?.request_number,
          title: tokenData.legal_deposit_requests?.title,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ACTION: REJECT ===
    if (body.action === "reject") {
      const { token, rejection_reason } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: "Token requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: tokenData } = await supabase
        .from("deposit_confirmation_tokens")
        .select("*, legal_deposit_requests(request_number, title, initiator_id)")
        .eq("token", token)
        .single();

      if (!tokenData) {
        return new Response(
          JSON.stringify({ success: false, error: "Token invalide" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Rejeter le token
      await supabase
        .from("deposit_confirmation_tokens")
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
          rejection_reason: rejection_reason || "Aucune raison fournie",
        })
        .eq("id", tokenData.id);

      // Notifier l'initiateur
      if (tokenData.legal_deposit_requests?.initiator_id) {
        await supabase.from("deposit_notifications").insert({
          user_id: tokenData.legal_deposit_requests.initiator_id,
          request_id: tokenData.request_id,
          notification_type: "confirmation_rejected",
          title: "Confirmation refusée",
          message: `La contrepartie a refusé de confirmer la demande "${tokenData.legal_deposit_requests.title}". Raison: ${rejection_reason || "Non spécifiée"}`,
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Refus enregistré" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === ACTION: GET STATUS ===
    if (body.action === "get_status") {
      const { request_id, token } = body;

      let query = supabase
        .from("deposit_confirmation_tokens")
        .select("*, legal_deposit_requests(request_number, title, confirmation_status)");

      if (request_id) {
        query = query.eq("request_id", request_id);
      } else if (token) {
        query = query.eq("token", token);
      } else {
        return new Response(
          JSON.stringify({ success: false, error: "request_id ou token requis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: tokens, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, tokens }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Action non reconnue" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[DEPOSIT-CONFIRMATION] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
