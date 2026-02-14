import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, recipientName, serviceName, montant, devise, registrationId } = await req.json();

    if (!to || !serviceName) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants (to, serviceName)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedAmount = montant ? `${montant} ${devise || 'DH'}` : 'Gratuit';
    const siteUrl = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";
    const paymentLink = `${siteUrl}/my-space?tab=payments`;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <div style="background: linear-gradient(135deg, #1a5632 0%, #2d7a4f 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Bibliothèque Nationale du Royaume du Maroc</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Demande de paiement</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #333;">Bonjour <strong>${recipientName || 'Cher(e) utilisateur'}</strong>,</p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              Votre demande d'inscription au service <strong>${serviceName}</strong> a été examinée. 
              Pour finaliser votre inscription, veuillez procéder au paiement.
            </p>
            
            <div style="background: #f8faf9; border: 1px solid #e0e8e3; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px; color: #1a5632; font-size: 16px;">Récapitulatif</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Service :</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-size: 14px;">Montant :</td>
                  <td style="padding: 8px 0; color: #1a5632; font-size: 18px; font-weight: 700; text-align: right;">${formattedAmount}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #1a5632 0%, #2d7a4f 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                Accéder à mon espace de paiement
              </a>
            </div>
            
            <div style="background: #fff8e6; border: 1px solid #f0d68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="margin: 0 0 8px; color: #8a6d00; font-size: 14px;">💳 Modes de paiement acceptés</h4>
              <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 13px; line-height: 1.8;">
                <li><strong>Paiement en ligne</strong> : <a href="${paymentLink}" style="color: #1a5632; text-decoration: underline;">Rendez-vous sur votre espace personnel</a> sur le portail BNRM pour payer par carte bancaire.</li>
                <li><strong>Virement bancaire</strong> : Veuillez effectuer un virement au compte de la BNRM et nous envoyer le justificatif.</li>
                <li><strong>Paiement sur place</strong> : Présentez-vous à la caisse de la BNRM avec votre numéro de demande.</li>
              </ul>
            </div>
            
            <p style="font-size: 13px; color: #888; line-height: 1.5;">
              Référence de la demande : <strong>${registrationId || 'N/A'}</strong><br/>
              Votre abonnement sera activé après confirmation du paiement par notre service comptable.
            </p>
          </div>
          
          <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; color: #999;">
              Bibliothèque Nationale du Royaume du Maroc<br/>
              Avenue Ibn Khaldoun, Agdal - Rabat
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to,
      subject: `Demande de paiement - ${serviceName} | BNRM`,
      html,
    });

    if (!result.success) {
      console.error("[SEND-PAYMENT-EMAIL] Failed:", result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SEND-PAYMENT-EMAIL] Email sent to ${to}, messageId: ${result.messageId}`);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[SEND-PAYMENT-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
