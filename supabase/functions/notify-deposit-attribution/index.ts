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

interface AttributionNotificationRequest {
  requestId: string;
  attributedNumbers?: {
    isbn?: string;
    issn?: string;
    ismn?: string;
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
      
      // Essayer différentes sources d'email dans les metadata
      if (metadata?.customFields?.author_email) {
        userEmail = metadata.customFields.author_email;
        userName = metadata.customFields.author_name || "Utilisateur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from customFields.author_email:", userEmail);
      } else if (metadata?.editor?.email) {
        userEmail = metadata.editor.email;
        userName = metadata.editor.name || "Éditeur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from editor:", userEmail);
      } else if (metadata?.publisher?.email) {
        userEmail = metadata.publisher.email;
        userName = metadata.publisher.name || "Éditeur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from publisher:", userEmail);
      } else if (metadata?.printer?.email) {
        userEmail = metadata.printer.email;
        userName = metadata.printer.name || "Imprimeur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from printer:", userEmail);
      } else if (metadata?.producer?.email) {
        userEmail = metadata.producer.email;
        userName = metadata.producer.name || "Producteur";
        console.log("[NOTIFY-ATTRIBUTION] Using email from producer:", userEmail);
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

    // Extraire les metadata pour afficher plus de détails
    const metadata = request.metadata as any || {};
    
    // Construire la liste des numéros attribués
    const numbers = attributedNumbers || {};
    let numbersHtml = '';
    let hasNumbers = false;
    
    if (numbers.isbn || request.isbn_assigned) {
      numbersHtml += `<tr><td style="padding: 10px 15px; font-weight: 600; color: #333;">ISBN</td><td style="padding: 10px 15px; font-family: monospace; font-size: 16px; color: #10b981; font-weight: bold;">${numbers.isbn || request.isbn_assigned}</td></tr>`;
      hasNumbers = true;
    }
    if (numbers.issn || request.issn_assigned) {
      numbersHtml += `<tr><td style="padding: 10px 15px; font-weight: 600; color: #333;">ISSN</td><td style="padding: 10px 15px; font-family: monospace; font-size: 16px; color: #10b981; font-weight: bold;">${numbers.issn || request.issn_assigned}</td></tr>`;
      hasNumbers = true;
    }
    if (numbers.ismn || request.ismn_assigned) {
      numbersHtml += `<tr><td style="padding: 10px 15px; font-weight: 600; color: #333;">ISMN</td><td style="padding: 10px 15px; font-family: monospace; font-size: 16px; color: #10b981; font-weight: bold;">${numbers.ismn || request.ismn_assigned}</td></tr>`;
      hasNumbers = true;
    }
    if (numbers.dlNumber || request.dl_number) {
      numbersHtml += `<tr><td style="padding: 10px 15px; font-weight: 600; color: #333;">N° Dépôt Légal</td><td style="padding: 10px 15px; font-family: monospace; font-size: 16px; color: #002B45; font-weight: bold;">${numbers.dlNumber || request.dl_number}</td></tr>`;
      hasNumbers = true;
    }

    if (!hasNumbers) {
      numbersHtml = '<tr><td colspan="2" style="padding: 15px; text-align: center; color: #666;">Les numéros d\'identification seront communiqués ultérieurement.</td></tr>';
    }

    // Extraire les informations de l'auteur/éditeur/imprimeur
    const authorName = metadata?.customFields?.author_name || metadata?.author?.name || '';
    const authorType = metadata?.customFields?.author_type === 'moral' ? 'Personne morale' : 'Personne physique';
    const editorName = metadata?.editor?.name || metadata?.publisher?.name || '';
    const editorAddress = metadata?.editor?.address || metadata?.publisher?.address || '';
    const printerName = metadata?.printer?.name || '';
    const printerAddress = metadata?.printer?.address || '';
    
    // Informations de publication
    const publicationType = request.support_type || 'Non spécifié';
    const language = metadata?.publication?.languages?.join(', ') || metadata?.language || '';
    const discipline = metadata?.publication?.discipline || '';
    const pageCount = metadata?.publication?.pageCount || '';
    const format = metadata?.publication?.format || '';
    const printRun = metadata?.publication?.printRun || '';
    const publicationDate = metadata?.publication?.publicationDate || '';
    
    // Formater la date de soumission
    const submissionDate = request.created_at ? new Date(request.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : '';

    // Construire les détails de la demande
    let detailsHtml = '';
    
    if (authorName) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666; width: 40%;">Auteur</td><td style="padding: 8px 0; font-weight: 500;">${authorName} <span style="color: #888; font-size: 12px;">(${authorType})</span></td></tr>`;
    }
    if (editorName) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Éditeur</td><td style="padding: 8px 0; font-weight: 500;">${editorName}</td></tr>`;
    }
    if (editorAddress) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Adresse éditeur</td><td style="padding: 8px 0;">${editorAddress}</td></tr>`;
    }
    if (printerName) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Imprimeur</td><td style="padding: 8px 0;">${printerName}</td></tr>`;
    }
    if (language) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Langue(s)</td><td style="padding: 8px 0;">${language}</td></tr>`;
    }
    if (discipline) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Discipline</td><td style="padding: 8px 0;">${discipline}</td></tr>`;
    }
    if (pageCount) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Nombre de pages</td><td style="padding: 8px 0;">${pageCount}</td></tr>`;
    }
    if (format) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Format</td><td style="padding: 8px 0;">${format}</td></tr>`;
    }
    if (printRun) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Tirage</td><td style="padding: 8px 0;">${printRun} exemplaires</td></tr>`;
    }
    if (publicationDate) {
      detailsHtml += `<tr><td style="padding: 8px 0; color: #666;">Date de publication</td><td style="padding: 8px 0;">${publicationDate}</td></tr>`;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 650px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 35px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
          .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 35px 30px; }
          .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { margin: 5px 0; font-size: 12px; color: #666; }
          .success-badge { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 25px; border-radius: 25px; font-weight: 600; font-size: 14px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); }
          .info-card { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0; }
          .info-card h3 { margin: 0 0 15px 0; color: #002B45; font-size: 16px; display: flex; align-items: center; gap: 8px; }
          .numbers-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 2px solid #10b981; }
          .numbers-card h3 { margin: 0 0 15px 0; color: #065f46; font-size: 18px; text-align: center; }
          .numbers-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .numbers-table tr:not(:last-child) { border-bottom: 1px solid #e5e7eb; }
          .details-table { width: 100%; border-collapse: collapse; }
          .btn { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 43, 69, 0.3); }
          .next-steps { background: #fffbeb; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .next-steps h4 { margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600; }
          .next-steps ul { margin: 0; padding-left: 20px; color: #78350f; }
          .next-steps li { margin: 6px 0; }
          .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
          .ref-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>المكتبة الوطنية للمملكة المغربية</h1>
            <h1 style="margin-top: 5px;">Bibliothèque Nationale du Royaume du Maroc</h1>
            <p>Département du Dépôt Légal - ISBN/ISSN/ISMN</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="success-badge">✓ DEMANDE VALIDÉE & NUMÉROS ATTRIBUÉS</span>
            </div>
            
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">Bonjour ${userName},</h2>
            
            <p style="font-size: 15px; color: #4b5563;">Nous avons le plaisir de vous informer que votre demande de dépôt légal a été <strong style="color: #10b981;">validée</strong> par le Département du Dépôt Légal de la BNRM.</p>
            
            <!-- Informations de base de la demande -->
            <div class="info-card">
              <h3>📄 Informations de la demande</h3>
              <table class="details-table">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;">Numéro de demande</td>
                  <td style="padding: 8px 0;"><span class="ref-badge">${request.request_number}</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Titre de l'œuvre</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">${request.title}</td>
                </tr>
                ${request.subtitle ? `<tr><td style="padding: 8px 0; color: #666;">Sous-titre</td><td style="padding: 8px 0;">${request.subtitle}</td></tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;">Type de support</td>
                  <td style="padding: 8px 0;">${publicationType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date de soumission</td>
                  <td style="padding: 8px 0;">${submissionDate}</td>
                </tr>
              </table>
            </div>
            
            <!-- Numéros attribués -->
            <div class="numbers-card">
              <h3>🏆 Numéros attribués</h3>
              <table class="numbers-table">
                ${numbersHtml}
              </table>
              <p style="text-align: center; margin: 15px 0 0 0; font-size: 13px; color: #065f46;">
                Conservez précieusement ces numéros pour vos publications.
              </p>
            </div>
            
            <!-- Détails de la publication -->
            ${detailsHtml ? `
            <div class="info-card">
              <h3>📚 Détails de la publication</h3>
              <table class="details-table">
                ${detailsHtml}
              </table>
            </div>
            ` : ''}
            
            <div class="next-steps">
              <h4>📋 Prochaines étapes</h4>
              <ul>
                <li>Téléchargez votre attestation depuis votre espace personnel</li>
                <li>Déposez les exemplaires requis à la BNRM dans un délai de <strong>30 jours</strong></li>
                <li>Intégrez les numéros attribués (ISBN/ISSN/ISMN) sur vos publications</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resolvePublicSiteUrl()}/my-space" class="btn">Accéder à mon espace</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280;">Pour toute question concernant votre demande, vous pouvez nous contacter par email ou par téléphone.</p>
            
            <p style="margin-top: 20px;">Cordialement,<br><strong style="color: #002B45;">L'équipe du Dépôt Légal - BNRM</strong></p>
          </div>
          <div class="footer">
            <p style="font-weight: 600; color: #333;">Bibliothèque Nationale du Royaume du Maroc</p>
            <p>Avenue Ibn Khaldoun, Agdal - Rabat, Maroc</p>
            <p>📞 +212 537 77 18 33 | ✉️ depot.legal@bnrm.ma</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              Ce message a été envoyé automatiquement suite à la validation de votre demande.<br>
              Merci de ne pas répondre directement à cet email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Utiliser le client SMTP partagé unifié
    const emailResult = await sendEmail({
      to: userEmail,
      subject: `Attribution Dépôt Légal - ${request.request_number} - Demande Validée`,
      html: emailHtml,
    });

    // Collecter tous les emails supplémentaires à notifier (éditeur, imprimeur, producteur, auteur)
    const additionalRecipients: { email: string; name: string; role: string }[] = [];
    
    // Ajouter l'éditeur s'il a un email différent du destinataire principal
    const editorEmail = metadata?.editor?.email || metadata?.publisher?.email;
    if (editorEmail && editorEmail !== userEmail) {
      additionalRecipients.push({
        email: editorEmail,
        name: metadata?.editor?.name || metadata?.publisher?.name || "Éditeur",
        role: "Éditeur"
      });
    }
    
    // Ajouter l'imprimeur s'il a un email différent
    const printerEmail = metadata?.printer?.email;
    if (printerEmail && printerEmail !== userEmail && printerEmail !== editorEmail) {
      additionalRecipients.push({
        email: printerEmail,
        name: metadata?.printer?.name || "Imprimeur",
        role: "Imprimeur"
      });
    }
    
    // Ajouter le producteur s'il a un email différent
    const producerEmail = metadata?.producer?.email;
    if (producerEmail && producerEmail !== userEmail && producerEmail !== editorEmail && producerEmail !== printerEmail) {
      additionalRecipients.push({
        email: producerEmail,
        name: metadata?.producer?.name || "Producteur",
        role: "Producteur"
      });
    }
    
    // Ajouter l'auteur s'il a un email différent
    const authorEmail = metadata?.customFields?.author_email;
    const authorDisplayName = metadata?.customFields?.author_name || "Auteur";
    if (authorEmail && authorEmail !== userEmail && !additionalRecipients.find(r => r.email === authorEmail)) {
      additionalRecipients.push({
        email: authorEmail,
        name: authorDisplayName,
        role: "Auteur"
      });
    }

    // Aussi récupérer les parties depuis legal_deposit_parties pour ne manquer personne
    try {
      const { data: parties } = await supabaseAdmin
        .from("legal_deposit_parties")
        .select("user_id, role, approval_status")
        .eq("request_id", requestId);

      if (parties && parties.length > 0) {
        for (const party of parties) {
          if (party.user_id) {
            try {
              const { data: partyAuth } = await supabaseAdmin.auth.admin.getUserById(party.user_id);
              if (partyAuth?.user?.email) {
                const partyEmail = partyAuth.user.email;
                if (partyEmail !== userEmail && !additionalRecipients.find(r => r.email === partyEmail)) {
                  const { data: partyProfile } = await supabaseAdmin
                    .from("profiles")
                    .select("first_name, last_name")
                    .eq("id", party.user_id)
                    .single();
                  const partyName = partyProfile?.first_name && partyProfile?.last_name
                    ? `${partyProfile.first_name} ${partyProfile.last_name}`
                    : party.role || "Participant";
                  additionalRecipients.push({
                    email: partyEmail,
                    name: partyName,
                    role: party.role || "Participant"
                  });
                }
              }
            } catch (err) {
              console.warn(`[NOTIFY-ATTRIBUTION] Could not resolve party user ${party.user_id}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.warn("[NOTIFY-ATTRIBUTION] Could not fetch parties:", err);
    }

    // Envoyer à tous les destinataires supplémentaires
    const notifiedRecipients: string[] = [];
    for (const recipient of additionalRecipients) {
      console.log(`[NOTIFY-ATTRIBUTION] Sending to ${recipient.role}: ${recipient.email}`);
      const recipientEmailHtml = emailHtml.replace(
        `Bonjour ${userName},`,
        `Bonjour ${recipient.name},`
      );
      const recipientResult = await sendEmail({
        to: recipient.email,
        subject: `Attribution Dépôt Légal - ${request.request_number} - Demande Validée`,
        html: recipientEmailHtml,
      });
      if (recipientResult.success) {
        console.log(`[NOTIFY-ATTRIBUTION] ${recipient.role} email sent successfully to ${recipient.email}`);
        notifiedRecipients.push(recipient.email);
      } else {
        console.warn(`[NOTIFY-ATTRIBUTION] ${recipient.role} email failed: ${recipientResult.error}`);
      }
    }

    if (emailResult.success) {
      console.log(`[NOTIFY-ATTRIBUTION] Email sent successfully via ${emailResult.method} to ${userEmail}, messageId: ${emailResult.messageId}`);

      return new Response(
        JSON.stringify({
          success: true,
          emailSent: true,
          message: `Notification envoyée avec succès via ${emailResult.method === 'smtp' ? 'SMTP' : 'Resend'}`,
          recipient: userEmail,
          additionalRecipients: notifiedRecipients,
          totalNotified: 1 + notifiedRecipients.length,
          method: emailResult.method,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("[NOTIFY-ATTRIBUTION] Email send failed:", emailResult.error);

      return new Response(
        JSON.stringify({
          success: false,
          emailSent: false,
          message: `Erreur d'envoi: ${emailResult.error}`,
          error: emailResult.error,
          recipient: userEmail,
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
