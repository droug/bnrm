import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'booking_approval' | 'booking_rejection' | 'visit_cancellation';
  recipient_email: string;
  recipient_name: string;
  data: {
    space_name?: string;
    organization_name?: string;
    start_date?: string;
    end_date?: string;
    booking_id?: string;
    rejection_reason?: string;
    visit_date?: string;
    visit_time?: string;
    visit_language?: string;
    nb_visiteurs?: number;
    cancellation_reason?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: NotificationRequest = await req.json();
    
    console.log("[CULTURAL-NOTIF] Processing notification:", {
      type: requestData.type,
      email: requestData.recipient_email
    });

    let subject = "";
    let htmlContent = "";

    switch (requestData.type) {
      case 'booking_approval': {
        subject = "✅ Réservation d'espace confirmée - BNRM";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #FAF9F5; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #666; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>✅ Réservation Confirmée</h1></div>
                <div class="content">
                  <p>Cher(e) ${requestData.recipient_name},</p>
                  <p>Nous avons le plaisir de vous confirmer que votre demande de réservation d'espace a été <strong>approuvée</strong>.</p>
                  <div class="info-box">
                    <h3>Détails de votre réservation :</h3>
                    <div class="info-row"><span class="label">Espace :</span> ${requestData.data.space_name}</div>
                    <div class="info-row"><span class="label">Organisation :</span> ${requestData.data.organization_name}</div>
                    <div class="info-row"><span class="label">Date de début :</span> ${requestData.data.start_date}</div>
                    <div class="info-row"><span class="label">Date de fin :</span> ${requestData.data.end_date}</div>
                    <div class="info-row"><span class="label">Référence :</span> ${requestData.data.booking_id}</div>
                  </div>
                  <p>Notre équipe vous contactera dans les plus brefs délais pour finaliser les modalités pratiques.</p>
                  <p>Cordialement,<br><strong>Le Département des Activités Culturelles</strong><br>Bibliothèque Nationale du Royaume du Maroc</p>
                  <div class="footer">
                    <p>Bibliothèque Nationale du Royaume du Maroc<br>Avenue Al Hadyquiya, Secteur Ryad, Rabat<br>Tél: +212 5 37 77 18 88</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;
      }

      case 'booking_rejection': {
        subject = "❌ Réservation d'espace refusée - BNRM";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #FAF9F5; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #EF4444; }
                .reason-box { background: #FEF2F2; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>❌ Réservation Refusée</h1></div>
                <div class="content">
                  <p>Cher(e) ${requestData.recipient_name},</p>
                  <p>Nous accusons réception de votre demande de réservation d'espace. Malheureusement, nous ne pouvons donner suite à votre demande.</p>
                  <div class="info-box">
                    <h3>Informations de la demande :</h3>
                    <p><strong>Espace :</strong> ${requestData.data.space_name}</p>
                    <p><strong>Organisation :</strong> ${requestData.data.organization_name}</p>
                    <p><strong>Période :</strong> ${requestData.data.start_date} - ${requestData.data.end_date}</p>
                  </div>
                  <div class="reason-box">
                    <h3>Motif du refus :</h3>
                    <p>${requestData.data.rejection_reason}</p>
                  </div>
                  <p>Nous vous remercions de l'intérêt que vous portez à la BNRM.</p>
                  <p>Cordialement,<br><strong>Le Département des Activités Culturelles</strong></p>
                  <div class="footer">
                    <p>Bibliothèque Nationale du Royaume du Maroc<br>Tél: +212 5 37 77 18 88</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;
      }

      case 'visit_cancellation': {
        subject = "⚠️ Annulation de visite guidée - BNRM";
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #FAF9F5; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #F59E0B; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; color: #666; }
                .alert-box { background: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #F59E0B; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>⚠️ Annulation de Visite Guidée</h1></div>
                <div class="content">
                  <p>Cher(e) ${requestData.recipient_name},</p>
                  <div class="alert-box">
                    <strong>⚠️ Information importante :</strong> Nous sommes au regret de vous informer que la visite guidée pour laquelle vous étiez inscrit(e) a été annulée.
                  </div>
                  <div class="info-box">
                    <h3>Détails de la visite annulée :</h3>
                    <div class="info-row"><span class="label">Date :</span> ${requestData.data.visit_date}</div>
                    <div class="info-row"><span class="label">Heure :</span> ${requestData.data.visit_time}</div>
                    <div class="info-row"><span class="label">Langue :</span> ${requestData.data.visit_language}</div>
                    <div class="info-row"><span class="label">Nombre de visiteurs :</span> ${requestData.data.nb_visiteurs}</div>
                  </div>
                  ${requestData.data.cancellation_reason ? `<div class="info-box"><h3>Raison de l'annulation :</h3><p>${requestData.data.cancellation_reason}</p></div>` : ''}
                  <p>Nous nous excusons pour ce désagrément. Nous vous invitons à réserver un autre créneau sur notre site.</p>
                  <p>Cordialement,<br><strong>Le Département des Activités Culturelles</strong></p>
                  <div class="footer">
                    <p>Bibliothèque Nationale du Royaume du Maroc<br>Tél: +212 5 37 77 18 88</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        break;
      }

      default:
        throw new Error(`Unknown notification type: ${requestData.type}`);
    }

    console.log(`[CULTURAL-NOTIF] Sending ${requestData.type} email to ${requestData.recipient_email}`);

    // Utiliser le client SMTP unifié
    const emailResult = await sendEmail({
      to: requestData.recipient_email,
      subject,
      html: htmlContent,
    });

    console.log(`[CULTURAL-NOTIF] Email result: ${emailResult.success ? 'success' : 'failed'} via ${emailResult.method || 'N/A'}`);

    return new Response(
      JSON.stringify({ 
        success: emailResult.success, 
        message: emailResult.success ? "Email sent successfully" : emailResult.error, 
        email_id: emailResult.messageId,
        method: emailResult.method,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[CULTURAL-NOTIF] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
