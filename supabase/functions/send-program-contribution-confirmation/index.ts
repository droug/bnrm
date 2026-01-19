import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.12";

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

// Fonction d'envoi d'email via SMTP (configuration admin) avec fallback Resend
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SMTP_FROM = Deno.env.get("SMTP_FROM");

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) {
    try {
      console.log(`[PROGRAM-CONFIRM] Sending email via SMTP to: ${to}`);
      
      const port = parseInt(SMTP_PORT, 10);
      const fromAddress = SMTP_FROM && SMTP_FROM.includes('@') ? SMTP_FROM : SMTP_USER;
      
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: port === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: to,
        subject: subject,
        html: html,
      });

      console.log("[PROGRAM-CONFIRM] Email sent via SMTP, messageId:", info.messageId);
      return { success: true, id: info.messageId };
    } catch (error: any) {
      console.error("[PROGRAM-CONFIRM] SMTP error:", error.message);
    }
  }

  // Fallback Resend
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "BNRM Activités Culturelles <onboarding@resend.dev>",
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: "No email service configured" };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nom, titre_activite, reference }: ProgramContributionConfirmationRequest = await req.json();

    console.log("Sending program contribution confirmation to:", email);

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

    const result = await sendEmail(email, "Accusé de réception – Proposition d'activité culturelle BNRM", emailHtml);

    console.log("Email result:", result);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-program-contribution-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
