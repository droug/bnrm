import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  request_type: string;
  request_id: string;
  notification_type: string;
  recipient_email: string;
  additional_data?: any;
}

// Fonction d'envoi d'email via SMTP ou Resend (fallback)
async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SMTP_FROM = Deno.env.get("SMTP_FROM");

  // Essayer SMTP d'abord
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) {
    try {
      console.log(`Sending email via SMTP to: ${to}`);
      
      const client = new SMTPClient({
        connection: {
          hostname: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          tls: parseInt(SMTP_PORT, 10) === 465,
          auth: {
            username: SMTP_USER,
            password: SMTP_PASSWORD,
          },
        },
      });

      await client.send({
        from: SMTP_FROM || "BNRM - Bibliothèque Nationale <noreply@bnrm.ma>",
        to: to,
        subject: subject,
        content: "auto",
        html: html,
      });

      await client.close();
      console.log("Email sent successfully via SMTP");
      return { success: true };
    } catch (error: any) {
      console.error("SMTP error:", error);
      // Continuer vers Resend si SMTP échoue
    }
  }

  // Fallback vers Resend
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    try {
      console.log(`Sending email via Resend (fallback) to: ${to}`);
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "BNRM - Bibliothèque Nationale <onboarding@resend.dev>",
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Resend error:", errorData);
        return { success: false, error: errorData.message || "Resend error" };
      }

      console.log("Email sent successfully via Resend");
      return { success: true };
    } catch (error: any) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: "No email service configured (SMTP or Resend)" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request_type, request_id, notification_type, recipient_email, additional_data }: NotificationRequest = await req.json();

    console.log("Sending workflow notification:", { request_type, request_id, notification_type, recipient_email });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les détails selon le type de demande
    let requestData: any = null;
    let emailSubject = "";
    let emailHtml = "";

    switch (request_type) {
      case "partnership":
        const { data: partnership } = await supabaseAdmin
          .from("partnerships")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = partnership;
        emailSubject = getPartnershipEmailSubject(notification_type, requestData);
        emailHtml = getPartnershipEmailHtml(notification_type, requestData, additional_data);
        break;

      case "legal_deposit":
        const { data: legalDeposit } = await supabaseAdmin
          .from("legal_deposit_requests")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = legalDeposit;
        emailSubject = getLegalDepositEmailSubject(notification_type, requestData);
        emailHtml = getLegalDepositEmailHtml(notification_type, requestData, additional_data);
        break;

      case "reproduction":
        const { data: reproduction } = await supabaseAdmin
          .from("reproduction_requests")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = reproduction;
        emailSubject = getReproductionEmailSubject(notification_type, requestData);
        emailHtml = getReproductionEmailHtml(notification_type, requestData, additional_data);
        break;

      case "booking":
        const { data: booking } = await supabaseAdmin
          .from("bookings")
          .select("*, cultural_spaces(*)")
          .eq("id", request_id)
          .single();
        requestData = booking;
        emailSubject = getBookingEmailSubject(notification_type, requestData);
        emailHtml = getBookingEmailHtml(notification_type, requestData, additional_data);
        break;

      case "visit":
        const { data: visit } = await supabaseAdmin
          .from("visits_bookings")
          .select("*, visits_slots(*)")
          .eq("id", request_id)
          .single();
        requestData = visit;
        emailSubject = getVisitEmailSubject(notification_type, requestData);
        emailHtml = getVisitEmailHtml(notification_type, requestData, additional_data);
        break;

      case "program":
        const { data: program } = await supabaseAdmin
          .from("program_contributions")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = program;
        emailSubject = getProgramEmailSubject(notification_type, requestData);
        emailHtml = getProgramEmailHtml(notification_type, requestData, additional_data);
        break;

      case "restoration":
        const { data: restoration } = await supabaseAdmin
          .from("restoration_requests")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = restoration;
        emailSubject = getRestorationEmailSubject(notification_type, requestData);
        emailHtml = getRestorationEmailHtml(notification_type, requestData, additional_data);
        break;

      case "cbm_adhesion_catalogue":
        const { data: adhesionCatalogue } = await supabaseAdmin
          .from("cbm_adhesions_catalogue")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = adhesionCatalogue;
        emailSubject = getCBMAdhesionEmailSubject(notification_type, requestData, "catalogue");
        emailHtml = getCBMAdhesionEmailHtml(notification_type, requestData, additional_data, "catalogue");
        break;

      case "cbm_adhesion_reseau":
        const { data: adhesionReseau } = await supabaseAdmin
          .from("cbm_adhesions_reseau")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = adhesionReseau;
        emailSubject = getCBMAdhesionEmailSubject(notification_type, requestData, "reseau");
        emailHtml = getCBMAdhesionEmailHtml(notification_type, requestData, additional_data, "reseau");
        break;

      case "cbm_formation":
        const { data: formation } = await supabaseAdmin
          .from("cbm_demandes_formation")
          .select("*")
          .eq("id", request_id)
          .single();
        requestData = formation;
        emailSubject = getCBMFormationEmailSubject(notification_type, requestData);
        emailHtml = getCBMFormationEmailHtml(notification_type, requestData, additional_data);
        break;

      default:
        throw new Error(`Type de demande non supporté: ${request_type}`);
    }

    if (!requestData) {
      throw new Error("Demande non trouvée");
    }

    // Envoyer l'email via SMTP ou Resend
    const emailResult = await sendEmail(recipient_email, emailSubject, emailHtml);

    if (!emailResult.success) {
      console.warn("Email sending failed:", emailResult.error);
      // On continue même si l'email échoue pour ne pas bloquer le workflow
    } else {
      console.log("Email sent successfully to:", recipient_email);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification envoyée",
        request_id,
        email_sent: emailResult.success,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-workflow-notification:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erreur interne du serveur",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ===== EMAIL TEMPLATES =====

function getEmailBase(content: string): string {
  return `
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
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #002B45; border-radius: 4px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
        .status-created { background: #e3f2fd; color: #1976d2; }
        .status-approved { background: #e8f5e9; color: #388e3c; }
        .status-rejected { background: #ffebee; color: #d32f2f; }
        .status-pending { background: #fff3e0; color: #f57c00; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Bibliothèque Nationale du Royaume du Maroc<br>
          Avenue Ibn Khaldoun, Rabat, Maroc<br>
          Tél: +212 537 77 18 33 | Email: contact@bnrm.ma</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Partnership emails
function getPartnershipEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Demande de partenariat reçue - ${data.id}`;
    case "approved":
      return `Votre demande de partenariat a été approuvée - ${data.id}`;
    case "rejected":
      return `Votre demande de partenariat a été rejetée - ${data.id}`;
    case "under_review":
      return `Votre demande de partenariat est en cours d'examen - ${data.id}`;
    default:
      return `Notification - Demande de partenariat ${data.id}`;
  }
}

function getPartnershipEmailHtml(type: string, data: any, additionalData: any): string {
  const statusClass = type === "approved" ? "status-approved" : type === "rejected" ? "status-rejected" : "status-pending";
  const statusText = type === "approved" ? "Approuvée" : type === "rejected" ? "Rejetée" : "En cours";
  
  let content = `
    <h2 style="color: #002B45;">Notification - Demande de partenariat</h2>
    <div class="info-box">
      <p><strong>Organisme:</strong> ${data.organisme || 'N/A'}</p>
      <p><strong>Type:</strong> ${data.partnership_type || 'N/A'}</p>
      <p><strong>Statut:</strong> <span class="status ${statusClass}">${statusText}</span></p>
    </div>
  `;

  if (type === "created") {
    content += `
      <p>Votre demande de partenariat a été bien reçue et sera examinée par notre équipe dans les meilleurs délais.</p>
      <p>Vous recevrez une notification dès qu'une décision sera prise.</p>
    `;
  } else if (type === "approved") {
    content += `
      <p>Nous avons le plaisir de vous informer que votre demande de partenariat a été approuvée.</p>
      <p>Notre équipe vous contactera prochainement pour finaliser les détails du partenariat.</p>
    `;
  } else if (type === "rejected") {
    content += `
      <p>Nous regrettons de vous informer que votre demande de partenariat n'a pas pu être approuvée.</p>
      ${additionalData?.comment ? `<p><strong>Motif:</strong> ${additionalData.comment}</p>` : ''}
      <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
    `;
  }

  return getEmailBase(content);
}

// Legal Deposit emails
function getLegalDepositEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Déclaration de dépôt légal enregistrée - ${data.request_number}`;
    case "validated":
      return `Votre dépôt légal a été validé - ${data.request_number}`;
    case "approved":
      return `Votre dépôt légal a été approuvé - ${data.request_number}`;
    case "rejected":
      return `Votre dépôt légal nécessite des modifications - ${data.request_number}`;
    default:
      return `Notification - Dépôt légal ${data.request_number}`;
  }
}

function getLegalDepositEmailHtml(type: string, data: any, additionalData: any): string {
  let content = `
    <h2 style="color: #002B45;">Notification - Dépôt légal</h2>
    <div class="info-box">
      <p><strong>Numéro de demande:</strong> ${data.request_number}</p>
      <p><strong>Titre:</strong> ${data.title || 'N/A'}</p>
      <p><strong>Statut:</strong> ${data.status || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `<p>Votre déclaration de dépôt légal a été enregistrée avec succès et sera traitée prochainement.</p>`;
  } else if (type === "validated") {
    content += `<p>Votre dépôt légal a été validé par notre équipe. Le processus suit son cours.</p>`;
  } else if (type === "approved") {
    content += `<p>Votre dépôt légal a été approuvé. Merci de votre collaboration.</p>`;
  } else if (type === "rejected") {
    content += `
      <p>Votre dépôt légal nécessite des modifications ou des compléments d'information.</p>
      ${additionalData?.comment ? `<p><strong>Commentaire:</strong> ${additionalData.comment}</p>` : ''}
    `;
  }

  return getEmailBase(content);
}

// Reproduction emails
function getReproductionEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Demande de reproduction enregistrée - ${data.request_number}`;
    case "approved":
      return `Votre demande de reproduction a été approuvée - ${data.request_number}`;
    case "ready":
      return `Votre commande de reproduction est prête - ${data.request_number}`;
    default:
      return `Notification - Demande de reproduction ${data.request_number}`;
  }
}

function getReproductionEmailHtml(type: string, data: any, additionalData: any): string {
  let content = `
    <h2 style="color: #002B45;">Notification - Demande de reproduction</h2>
    <div class="info-box">
      <p><strong>Numéro de demande:</strong> ${data.request_number}</p>
      <p><strong>Statut:</strong> ${data.status || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `<p>Votre demande de reproduction a été enregistrée. Nous la traiterons dans les meilleurs délais.</p>`;
  } else if (type === "approved") {
    content += `<p>Votre demande de reproduction a été approuvée et est en cours de traitement.</p>`;
  } else if (type === "ready") {
    content += `<p>Votre commande de reproduction est prête. Vous pouvez venir la récupérer.</p>`;
  }

  return getEmailBase(content);
}

// Booking emails
function getBookingEmailSubject(type: string, data: any): string {
  const spaceName = data.cultural_spaces?.name || 'espace';
  switch (type) {
    case "created":
      return `Réservation d'espace enregistrée - ${spaceName}`;
    case "validated":
      return `Votre réservation a été validée - ${spaceName}`;
    case "confirmed":
      return `Votre réservation est confirmée - ${spaceName}`;
    case "rejected":
      return `Votre réservation a été rejetée - ${spaceName}`;
    default:
      return `Notification - Réservation d'espace ${spaceName}`;
  }
}

function getBookingEmailHtml(type: string, data: any, additionalData: any): string {
  const spaceName = data.cultural_spaces?.name || 'N/A';
  
  let content = `
    <h2 style="color: #002B45;">Notification - Réservation d'espace</h2>
    <div class="info-box">
      <p><strong>Espace:</strong> ${spaceName}</p>
      <p><strong>Organisme:</strong> ${data.organization_name || 'N/A'}</p>
      <p><strong>Dates:</strong> ${new Date(data.start_date).toLocaleDateString('fr-FR')} - ${new Date(data.end_date).toLocaleDateString('fr-FR')}</p>
      <p><strong>Statut:</strong> ${data.status || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `<p>Votre demande de réservation a été enregistrée. Elle sera examinée par notre équipe.</p>`;
  } else if (type === "validated") {
    content += `<p>Votre réservation a été validée et est en attente de confirmation finale.</p>`;
  } else if (type === "confirmed") {
    content += `<p>Votre réservation est confirmée. Nous vous contacterons pour finaliser les détails.</p>`;
  } else if (type === "rejected") {
    content += `
      <p>Votre demande de réservation n'a pas pu être acceptée.</p>
      ${additionalData?.comment ? `<p><strong>Motif:</strong> ${additionalData.comment}</p>` : ''}
    `;
  }

  return getEmailBase(content);
}

// Visit emails
function getVisitEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Réservation de visite enregistrée`;
    case "confirmed":
      return `Votre visite guidée est confirmée`;
    case "cancelled":
      return `Annulation de votre visite guidée`;
    default:
      return `Notification - Visite guidée`;
  }
}

function getVisitEmailHtml(type: string, data: any, additionalData: any): string {
  const slot = data.visits_slots;
  
  let content = `
    <h2 style="color: #002B45;">Notification - Visite guidée</h2>
    <div class="info-box">
      <p><strong>Nom:</strong> ${data.nom || 'N/A'}</p>
      <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
      ${slot ? `
        <p><strong>Date:</strong> ${new Date(slot.date_visite).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure:</strong> ${slot.heure_debut}</p>
      ` : ''}
      <p><strong>Nombre de visiteurs:</strong> ${data.nb_visiteurs || 'N/A'}</p>
    </div>
  `;

  if (type === "created" || type === "confirmed") {
    content += `<p>Votre réservation de visite guidée a été confirmée. Merci de vous présenter 10 minutes avant l'heure prévue.</p>`;
  } else if (type === "cancelled") {
    content += `<p>Votre visite guidée a été annulée.</p>`;
  }

  return getEmailBase(content);
}

// Program contribution emails
function getProgramEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Proposition de programme enregistrée - ${data.numero_reference}`;
    case "accepted":
      return `Votre proposition a été acceptée - ${data.numero_reference}`;
    case "rejected":
      return `Décision concernant votre proposition - ${data.numero_reference}`;
    default:
      return `Notification - Proposition de programme ${data.numero_reference}`;
  }
}

function getProgramEmailHtml(type: string, data: any, additionalData: any): string {
  let content = `
    <h2 style="color: #002B45;">Notification - Proposition de programme</h2>
    <div class="info-box">
      <p><strong>Référence:</strong> ${data.numero_reference}</p>
      <p><strong>Titre:</strong> ${data.titre_proposition || 'N/A'}</p>
      <p><strong>Type:</strong> ${data.type_programme || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `<p>Votre proposition de programme a été enregistrée. Elle sera évaluée par notre comité.</p>`;
  } else if (type === "accepted") {
    content += `<p>Nous avons le plaisir de vous informer que votre proposition a été acceptée. Nous vous contacterons prochainement.</p>`;
  } else if (type === "rejected") {
    content += `
      <p>Votre proposition n'a pas été retenue pour cette fois.</p>
      ${additionalData?.feedback ? `<p><strong>Retour:</strong> ${additionalData.feedback}</p>` : ''}
    `;
  }

  return getEmailBase(content);
}

// Restoration emails
function getRestorationEmailSubject(type: string, data: any): string {
  switch (type) {
    case "created":
      return `Demande de restauration enregistrée - ${data.request_number}`;
    case "in_progress":
      return `Votre demande de restauration est en cours - ${data.request_number}`;
    case "completed":
      return `Restauration terminée - ${data.request_number}`;
    default:
      return `Notification - Demande de restauration ${data.request_number}`;
  }
}

function getRestorationEmailHtml(type: string, data: any, additionalData: any): string {
  let content = `
    <h2 style="color: #002B45;">Notification - Demande de restauration</h2>
    <div class="info-box">
      <p><strong>Numéro:</strong> ${data.request_number}</p>
      <p><strong>Manuscrit:</strong> ${data.manuscript_title || 'N/A'}</p>
      <p><strong>Statut:</strong> ${data.status || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `<p>Votre demande de restauration a été enregistrée. Notre équipe l'examinera prochainement.</p>`;
  } else if (type === "in_progress") {
    content += `<p>La restauration de votre manuscrit est en cours. Nous vous tiendrons informé de l'avancement.</p>`;
  } else if (type === "completed") {
    content += `<p>La restauration de votre manuscrit est terminée. Vous pouvez venir le récupérer.</p>`;
  }

  return getEmailBase(content);
}

// CBM Adhesion emails
function getCBMAdhesionEmailSubject(type: string, data: any, adhesionType: string): string {
  const typeLabel = adhesionType === "catalogue" ? "au Catalogue Collectif" : "au Réseau des Bibliothèques";
  switch (type) {
    case "created":
      return `Demande d'adhésion ${typeLabel} enregistrée - ${data.nom_bibliotheque}`;
    case "en_validation":
      return `Votre demande d'adhésion est en cours de validation - ${data.nom_bibliotheque}`;
    case "approved":
      return `Votre demande d'adhésion ${typeLabel} a été approuvée - ${data.nom_bibliotheque}`;
    case "rejected":
      return `Décision concernant votre demande d'adhésion - ${data.nom_bibliotheque}`;
    default:
      return `Notification - Demande d'adhésion ${data.nom_bibliotheque}`;
  }
}

function getCBMAdhesionEmailHtml(type: string, data: any, additionalData: any, adhesionType: string): string {
  const typeLabel = adhesionType === "catalogue" ? "Catalogue Collectif du Maroc" : "Réseau des Bibliothèques du Maroc";
  
  let content = `
    <h2 style="color: #002B45;">Notification - Adhésion au ${typeLabel}</h2>
    <div class="info-box">
      <p><strong>Bibliothèque:</strong> ${data.nom_bibliotheque}</p>
      <p><strong>Type:</strong> ${data.type_bibliotheque || 'N/A'}</p>
      <p><strong>Ville:</strong> ${data.ville || 'N/A'}</p>
      <p><strong>Région:</strong> ${data.region || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `
      <p>Votre demande d'adhésion au ${typeLabel} a été enregistrée avec succès.</p>
      <p>Elle sera examinée par notre équipe et vous serez notifié de la décision.</p>
    `;
  } else if (type === "en_validation") {
    content += `
      <p>Votre demande d'adhésion est actuellement en cours de validation par le comité de pilotage.</p>
      <p>Vous recevrez une notification dès qu'une décision sera prise.</p>
    `;
  } else if (type === "approved") {
    content += `
      <p>Nous avons le plaisir de vous informer que votre demande d'adhésion au ${typeLabel} a été <strong>approuvée</strong>.</p>
      <p>Bienvenue dans le réseau ! Notre équipe vous contactera prochainement pour les prochaines étapes.</p>
    `;
  } else if (type === "rejected") {
    content += `
      <p>Nous regrettons de vous informer que votre demande d'adhésion n'a pas pu être acceptée.</p>
      ${additionalData?.reason ? `<p><strong>Motif:</strong> ${additionalData.reason}</p>` : ''}
      <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
    `;
  }

  return getEmailBase(content);
}

// CBM Formation emails
function getCBMFormationEmailSubject(type: string, data: any): string {
  const formationType = data.type_formation || 'Formation';
  switch (type) {
    case "created":
      return `Demande de formation enregistrée - ${data.nom_organisme}`;
    case "en_validation":
      return `Votre demande de formation est en cours de validation - ${formationType}`;
    case "approved":
      return `Votre demande de formation a été approuvée - ${formationType}`;
    case "rejected":
      return `Décision concernant votre demande de formation - ${formationType}`;
    default:
      return `Notification - Demande de formation ${data.nom_organisme}`;
  }
}

function getCBMFormationEmailHtml(type: string, data: any, additionalData: any): string {
  const formationTypeLabels: Record<string, string> = {
    formats_marc: "Formats MARC",
    catalogage: "Catalogage",
    indexation: "Indexation",
    gestion_sigb: "Gestion SIGB",
    services_numeriques: "Services numériques",
    autre: "Autre"
  };
  
  const formationType = formationTypeLabels[data.type_formation] || data.type_formation;
  
  let content = `
    <h2 style="color: #002B45;">Notification - Demande de Formation</h2>
    <div class="info-box">
      <p><strong>Organisme:</strong> ${data.nom_organisme || 'N/A'}</p>
      <p><strong>Type de formation:</strong> ${formationType}</p>
      <p><strong>Contact:</strong> ${data.nom_contact || 'N/A'}</p>
      <p><strong>Nombre de participants:</strong> ${data.nombre_participants || 'N/A'}</p>
    </div>
  `;

  if (type === "created") {
    content += `
      <p>Votre demande de formation a été enregistrée avec succès.</p>
      <p>Elle sera examinée par notre équipe et vous serez notifié de la décision.</p>
    `;
  } else if (type === "en_validation") {
    content += `
      <p>Votre demande de formation est actuellement en cours de validation par le comité de pilotage.</p>
      <p>Vous recevrez une notification dès qu'une décision sera prise.</p>
    `;
  } else if (type === "approved") {
    content += `
      <p>Nous avons le plaisir de vous informer que votre demande de formation a été <strong>approuvée</strong>.</p>
      <p>Notre équipe vous contactera prochainement pour organiser les sessions de formation.</p>
    `;
  } else if (type === "rejected") {
    content += `
      <p>Nous regrettons de vous informer que votre demande de formation n'a pas pu être acceptée.</p>
      ${additionalData?.reason ? `<p><strong>Motif:</strong> ${additionalData.reason}</p>` : ''}
      <p>N'hésitez pas à soumettre une nouvelle demande ultérieurement.</p>
    `;
  }

  return getEmailBase(content);
}
