import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProgramContributionConfirmationRequest {
  contribution_id: string;
  email: string;
  nom: string;
  titre_activite: string;
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nom, titre_activite, reference }: ProgramContributionConfirmationRequest = await req.json();

    console.log("[PROGRAM-CONFIRM] Sending confirmation to:", email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', 'Noto Sans', sans-serif; color: #333333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FAF9F5, #ffffff); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; border-bottom: 3px solid #D4AF37; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; }
          .reference { background: #D4AF37; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; display: inline-block; margin: 20px 0; }
          .info-box { background: #FAF9F5; padding: 20px; border-radius: 12px; border-left: 4px solid #D4AF37; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          h1 { color: #333333; margin: 0; font-size: 24px; }
          p { margin: 10px 0; }
          strong { color: #D4AF37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎭 Bibliothèque Nationale du Royaume du Maroc</h1>
            <p style="margin: 10px 0 0 0; color: #333333;">Département des Activités Culturelles</p>
          </div>
          <div class="content">
            <p>Bonjour <strong>${nom}</strong>,</p>
            
            <p>Nous accusons réception de votre proposition d'activité culturelle intitulée :</p>
            
            <div class="info-box">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333333;">« ${titre_activite} »</p>
            </div>
            
            <p>Votre demande a bien été transmise au <strong>Département des Activités Culturelles</strong> et sera examinée dans les meilleurs délais.</p>
            
            <div style="text-align: center;">
              <span class="reference">Référence : ${reference}</span>
            </div>
            
            <div class="info-box">
              <p><strong>📋 Prochaines étapes :</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Examen de votre dossier par notre équipe</li>
                <li>Évaluation de la faisabilité technique et logistique</li>
                <li>Notification de la décision par email</li>
              </ul>
            </div>
            
            <p>Vous pouvez suivre l'état de votre demande en conservant ce numéro de référence.</p>
            
            <p style="margin-top: 30px;">Cordialement,</p>
            <p><strong>L'équipe des Activités Culturelles</strong><br>
            Bibliothèque Nationale du Royaume du Maroc</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>© ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Utiliser le client SMTP unifié
    const emailResult = await sendEmail({
      to: email,
      subject: "Accusé de réception – Proposition d'activité culturelle BNRM",
      html: emailHtml,
    });

    console.log(`[PROGRAM-CONFIRM] Email result: ${emailResult.success ? 'success' : 'failed'} via ${emailResult.method || 'N/A'}`);

    return new Response(JSON.stringify({
      success: emailResult.success,
      id: emailResult.messageId,
      method: emailResult.method,
      error: emailResult.error,
    }), {
      status: emailResult.success ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[PROGRAM-CONFIRM] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
