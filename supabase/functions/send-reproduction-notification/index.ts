import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  recipientEmail?: string;
  recipientId?: string;
  notificationType: string;
  requestNumber: string;
  documentTitle: string;
  reproductionType?: string;
  format?: string;
  estimatedCost?: number;
  additionalInfo?: string;
  paymentLink?: string; // Lien de paiement Stripe
  paymentMethod?: 'stripe' | 'virement' | 'especes' | 'all'; // Méthode de paiement
}

type ReproductionPaymentSettings = {
  stripe: { enabled: boolean };
  virement: {
    enabled: boolean;
    bank_name: string;
    rib: string;
    proof_email: string;
    object_prefix: string;
  };
  espece: { enabled: boolean; address: string; hours: string };
};

const DEFAULT_PAYMENT_SETTINGS: ReproductionPaymentSettings = {
  stripe: { enabled: true },
  virement: {
    enabled: true,
    bank_name: "Trésorerie Générale du Royaume",
    rib: "310 780 1001 0009 7500 0000 01",
    proof_email: "reproduction@bnrm.ma",
    object_prefix: "Reproduction",
  },
  espece: {
    enabled: true,
    address: "Avenue Ibn Khaldoun, Rabat",
    hours: "Du lundi au vendredi, 9h00 - 16h00",
  },
};

const PAYMENT_SETTINGS_PARAM_KEY = "reproduction_payment_settings";

const safeParsePaymentSettings = (raw: unknown): ReproductionPaymentSettings => {
  if (typeof raw !== "string" || raw.trim() === "") return DEFAULT_PAYMENT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return {
      stripe: { enabled: !!parsed?.stripe?.enabled },
      virement: {
        enabled: parsed?.virement?.enabled !== false,
        bank_name: String(parsed?.virement?.bank_name ?? DEFAULT_PAYMENT_SETTINGS.virement.bank_name),
        rib: String(parsed?.virement?.rib ?? DEFAULT_PAYMENT_SETTINGS.virement.rib),
        proof_email: String(parsed?.virement?.proof_email ?? DEFAULT_PAYMENT_SETTINGS.virement.proof_email),
        object_prefix: String(parsed?.virement?.object_prefix ?? DEFAULT_PAYMENT_SETTINGS.virement.object_prefix),
      },
      espece: {
        enabled: parsed?.espece?.enabled !== false,
        address: String(parsed?.espece?.address ?? DEFAULT_PAYMENT_SETTINGS.espece.address),
        hours: String(parsed?.espece?.hours ?? DEFAULT_PAYMENT_SETTINGS.espece.hours),
      },
    };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
};

const loadPaymentSettings = async (supabase: ReturnType<typeof createClient>): Promise<ReproductionPaymentSettings> => {
  try {
    const { data, error } = await supabase
      .from("bnrm_parametres")
      .select("valeur")
      .eq("parametre", PAYMENT_SETTINGS_PARAM_KEY)
      .maybeSingle();

    if (error) throw error;
    return safeParsePaymentSettings(data?.valeur);
  } catch (e) {
    console.warn("[REPRODUCTION-NOTIF] Could not load payment settings, fallback to defaults:", e);
    return DEFAULT_PAYMENT_SETTINGS;
  }
};

// Helper pour générer le HTML des options de paiement
const getPaymentOptionsHtml = (
  amount: number | undefined, 
  stripeLink: string | undefined, 
  siteUrl: string,
  paymentMethod: string | undefined,
  settings: ReproductionPaymentSettings,
  requestNumber: string
): string => {
  const showStripe = settings.stripe.enabled && (!paymentMethod || paymentMethod === 'stripe' || paymentMethod === 'all');
  const showVirement = settings.virement.enabled && (!paymentMethod || paymentMethod === 'virement' || paymentMethod === 'all');
  const showEspeces = settings.espece.enabled && (!paymentMethod || paymentMethod === 'especes' || paymentMethod === 'all');
  
  let html = `<h3 style="color: #002B45; margin-top: 25px;">💳 Options de paiement</h3>`;
  
  // Option 1: Paiement en ligne Stripe
  if (showStripe) {
    html += `
      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
        <h4 style="margin: 0 0 10px 0; color: #2e7d32;">💳 Paiement par carte bancaire (en ligne)</h4>
        <p style="margin: 0 0 15px 0;">Payez immédiatement et en toute sécurité avec votre carte bancaire.</p>
        ${stripeLink ? `
          <a href="${stripeLink}" style="display: inline-block; background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Payer maintenant ${amount ? `(${amount} DH)` : ''}
          </a>
        ` : `
          <a href="${siteUrl}/my-space?tab=reproductions" style="display: inline-block; background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Payer depuis mon espace
          </a>
        `}
      </div>
    `;
  }
  
  // Option 2: Virement bancaire
  if (showVirement) {
    html += `
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1976d2;">
        <h4 style="margin: 0 0 10px 0; color: #1565c0;">🏦 Virement bancaire</h4>
        <p style="margin: 0 0 10px 0;">Effectuez un virement sur le compte de la BNRM:</p>
        <div style="background: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 13px;">
          <p style="margin: 5px 0;"><strong>Banque:</strong> ${settings.virement.bank_name}</p>
          <p style="margin: 5px 0;"><strong>RIB:</strong> ${settings.virement.rib}</p>
          <p style="margin: 5px 0;"><strong>Objet:</strong> ${settings.virement.object_prefix} - ${requestNumber}${amount ? ` - ${amount} DH` : ''}</p>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Envoyez-nous le justificatif de virement par email à ${settings.virement.proof_email}</p>
      </div>
    `;
  }
  
  // Option 3: Paiement sur place
  if (showEspeces) {
    html += `
      <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
        <h4 style="margin: 0 0 10px 0; color: #e65100;">🏛️ Paiement sur place</h4>
        <p style="margin: 0;">Présentez-vous à la caisse de la BNRM avec votre numéro de demande.</p>
        <p style="margin: 10px 0 0 0; font-size: 13px;">
          <strong>Horaires:</strong> ${settings.espece.hours}<br>
          <strong>Adresse:</strong> ${settings.espece.address}
        </p>
      </div>
    `;
  }
  
  return html;
};

const getEmailContent = (
  n: NotificationRequest,
  paymentSettings: ReproductionPaymentSettings = DEFAULT_PAYMENT_SETTINGS
) => {
  const { notificationType, requestNumber, documentTitle, reproductionType, format, estimatedCost, additionalInfo, paymentLink, paymentMethod } = n;
  
  const formatLabel = format ? 
    (format === 'pdf' ? 'PDF' : format === 'jpeg' ? 'JPEG' : format === 'tiff' ? 'TIFF' : format) : '';
  
  const reproductionLabel = reproductionType ?
    (reproductionType === 'numerique' ? 'Numérique' : reproductionType === 'papier' ? 'Papier' : reproductionType === 'microfilm' ? 'Microfilm' : reproductionType) : '';

  const base = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f0f0f0; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #002B45; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .info-row { display: flex; margin-bottom: 10px; }
        .info-label { font-weight: bold; min-width: 150px; color: #555; }
        .info-value { color: #333; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .status-received { background: #e3f2fd; color: #1976d2; }
        .status-approved { background: #e8f5e9; color: #388e3c; }
        .status-ready { background: #e8f5e9; color: #2e7d32; }
        .status-pending { background: #fff3e0; color: #f57c00; }
        .status-rejected { background: #ffebee; color: #d32f2f; }
        h2 { color: #002B45; margin-top: 0; }
        .cost-highlight { background: #002B45; color: white; padding: 15px 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .cost-amount { font-size: 28px; font-weight: bold; }
        .cta-button { display: inline-block; background: #002B45; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Bibliothèque Nationale du Royaume du Maroc</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Service de Reproduction</p>
        </div>
        <div class="content">
  `;
  
  const footer = `
        </div>
        <div class="footer">
          <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong><br>
          Avenue Ibn Khaldoun, Rabat, Maroc<br>
          Tél: +212 537 77 18 73 | Email: reproduction@bnrm.ma</p>
          <p style="color: #999; font-size: 11px;">Ce message est envoyé automatiquement. Merci de ne pas y répondre directement.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  switch (notificationType) {
    case 'request_received':
      return {
        subject: `✅ Demande de reproduction reçue - ${requestNumber}`,
        html: `${base}
          <h2>📋 Demande de reproduction enregistrée</h2>
          <p>Votre demande de reproduction a été <strong>enregistrée avec succès</strong>. Elle sera traitée dans les meilleurs délais par notre équipe.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">N° de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Document:</span><span class="info-value">${documentTitle}</span></p>
            ${reproductionLabel ? `<p class="info-row"><span class="info-label">Type de reproduction:</span><span class="info-value">${reproductionLabel}</span></p>` : ''}
            ${formatLabel ? `<p class="info-row"><span class="info-label">Format:</span><span class="info-value">${formatLabel}</span></p>` : ''}
            <p class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-received">Reçue</span></p>
          </div>
          
          ${estimatedCost ? `
            <div class="cost-highlight">
              <p style="margin: 0;">Estimation du coût</p>
              <p class="cost-amount">${estimatedCost} DH</p>
              <p style="margin: 0; font-size: 12px;">Ce montant est indicatif et sera confirmé par notre équipe.</p>
            </div>
          ` : ''}
          
          <h3>📌 Prochaines étapes</h3>
          <ol>
            <li>Validation de votre demande par notre équipe</li>
            <li>Envoi du devis définitif</li>
            <li>Paiement et traitement</li>
            <li>Réception de votre reproduction</li>
          </ol>
          
          <p>Vous pouvez suivre l'état de votre demande dans votre <strong>Espace Personnel</strong>.</p>
        ${footer}`
      };
      
    case 'quote_sent':
      return {
        subject: `💰 Devis disponible - ${requestNumber}`,
        html: `${base}
          <h2>💰 Devis pour votre demande de reproduction</h2>
          <p>Le devis pour votre demande de reproduction est maintenant disponible.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">N° de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Document:</span><span class="info-value">${documentTitle}</span></p>
            <p class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-pending">En attente de paiement</span></p>
          </div>
          
          ${estimatedCost ? `
            <div class="cost-highlight">
              <p style="margin: 0;">Montant à régler</p>
              <p class="cost-amount">${estimatedCost} DH</p>
            </div>
          ` : ''}
          
          <p>Connectez-vous à votre espace personnel pour consulter le devis détaillé et procéder au paiement.</p>
        ${footer}`
      };
      
    case 'payment_pending':
    case 'approved':
    case 'approval':
      const siteUrl = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";
      const paymentOptions = getPaymentOptionsHtml(
        estimatedCost,
        paymentLink,
        siteUrl,
        paymentMethod,
        paymentSettings,
        requestNumber
      );
      
      return {
        subject: `✅ Demande approuvée - En attente de paiement - ${requestNumber}`,
        html: `${base}
          <h2>✅ Votre demande a été approuvée</h2>
          <p>Votre demande de reproduction a été <strong>approuvée</strong> et est prête pour le paiement.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">Numéro de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-pending">En attente de paiement</span></p>
            ${estimatedCost ? `<p class="info-row"><span class="info-label">Montant:</span><span class="info-value"><strong>${estimatedCost} DH</strong></span></p>` : ''}
          </div>
          
          ${estimatedCost ? `
            <div class="cost-highlight">
              <p style="margin: 0;">Montant à régler</p>
              <p class="cost-amount">${estimatedCost} DH</p>
            </div>
          ` : ''}
          
          ${paymentOptions}
          
          <p style="margin-top: 20px; color: #666; font-size: 13px;">Pour toute question, contactez notre service au <strong>+212 537 77 18 73</strong> ou par email à <strong>reproduction@bnrm.ma</strong></p>
        ${footer}`
      };
      
    case 'ready':
      return {
        subject: `🎉 Reproduction prête - ${requestNumber}`,
        html: `${base}
          <h2>🎉 Votre reproduction est prête !</h2>
          <p>Nous avons le plaisir de vous informer que votre reproduction est <strong>prête à être récupérée</strong>.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">N° de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Document:</span><span class="info-value">${documentTitle}</span></p>
            <p class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-ready">Prête</span></p>
          </div>
          
          <h3>📍 Retrait</h3>
          <p>Vous pouvez récupérer votre reproduction au <strong>Service de reproduction</strong> de la Bibliothèque Nationale, du lundi au vendredi de 9h à 16h.</p>
          <p>N'oubliez pas de vous munir d'une pièce d'identité et de votre numéro de demande.</p>
          
          ${additionalInfo ? `<p><strong>Information complémentaire:</strong> ${additionalInfo}</p>` : ''}
        ${footer}`
      };
      
    case 'rejected':
      return {
        subject: `❌ Demande refusée - ${requestNumber}`,
        html: `${base}
          <h2>❌ Demande de reproduction refusée</h2>
          <p>Nous regrettons de vous informer que votre demande de reproduction n'a pas pu être acceptée.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">N° de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Document:</span><span class="info-value">${documentTitle}</span></p>
            <p class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-rejected">Refusée</span></p>
          </div>
          
          ${additionalInfo ? `
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Motif:</strong> ${additionalInfo}</p>
            </div>
          ` : ''}
          
          <p>Pour plus d'informations, vous pouvez contacter notre service de reproduction.</p>
        ${footer}`
      };
      
    default:
      return {
        subject: `📄 Notification - ${requestNumber}`,
        html: `${base}
          <h2>📄 Mise à jour de votre demande</h2>
          <p>Une mise à jour concernant votre demande de reproduction est disponible.</p>
          
          <div class="info-box">
            <p class="info-row"><span class="info-label">N° de demande:</span><span class="info-value"><strong>${requestNumber}</strong></span></p>
            <p class="info-row"><span class="info-label">Document:</span><span class="info-value">${documentTitle}</span></p>
          </div>
          
          <p>Connectez-vous à votre espace personnel pour plus de détails.</p>
        ${footer}`
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const notification: NotificationRequest = await req.json();

     // Résoudre l'email du destinataire si non fourni (lookup auth.users via admin API)
     let recipientEmail = notification.recipientEmail;
     if (!recipientEmail) {
       if (!notification.recipientId) {
         throw new Error("recipientEmail ou recipientId est requis");
       }
       const { data: userData, error: userError } = await supabase.auth.admin.getUserById(notification.recipientId);
       if (userError) throw userError;
       recipientEmail = userData.user?.email;
     }

     if (!recipientEmail) {
       throw new Error("Impossible de déterminer l'email du destinataire");
     }

     // Charger settings paiement
     const paymentSettings = await loadPaymentSettings(supabase);
    
    console.log("[REPRODUCTION-NOTIF] Sending notification:", {
      type: notification.notificationType,
      to: recipientEmail,
      requestNumber: notification.requestNumber
    });

    // Enregistrer la notification dans la base (optionnel)
    try {
        await supabase.from('notifications').insert({
          user_id: notification.recipientId,
        type: 'reproduction',
        title: `Demande de reproduction ${notification.notificationType}`,
        message: `Mise à jour pour la demande ${notification.requestNumber}`,
        is_read: false,
        category: 'reproduction',
        module: 'digital-library',
        data: {
          request_id: notification.requestId,
          request_number: notification.requestNumber,
          notification_type: notification.notificationType
        }
      });
    } catch (dbError) {
      console.warn("[REPRODUCTION-NOTIF] Could not save to notifications table:", dbError);
    }

    const emailContent = getEmailContent(notification, paymentSettings);
    
    // Utiliser le client SMTP unifié
    const result = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log("[REPRODUCTION-NOTIF] Email result:", result);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        email_sent: result.success, 
        method: result.method,
        message_id: result.messageId
      }), 
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: any) {
    console.error("[REPRODUCTION-NOTIF] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
