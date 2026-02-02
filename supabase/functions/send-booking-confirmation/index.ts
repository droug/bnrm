import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
  organizationName: string;
  eventTitle: string;
  eventDescription: string;
  spaceName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  contactPhone: string;
  contactAddress: string;
  contactCity: string;
  contactCountry: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[BOOKING-CONFIRM] Received booking confirmation request");
    const bookingData: BookingConfirmationRequest = await req.json();
    console.log("[BOOKING-CONFIRM] Booking data:", JSON.stringify(bookingData, null, 2));

    // Email HTML template pour le client
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #002B45; }
            .footer { margin-top: 30px; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Demande de réservation reçue</h1>
              <p>Bibliothèque Nationale du Royaume du Maroc</p>
            </div>
            
            <div class="content">
              <p>Bonjour ${bookingData.userName},</p>
              
              <p>Votre demande de réservation a bien été transmise à la Bibliothèque Nationale du Royaume du Maroc.</p>
              
              <div class="alert">
                <strong>Numéro de référence :</strong> ${bookingData.bookingId.slice(0, 8).toUpperCase()}
              </div>
              
              <h2>Détails de votre réservation</h2>
              
              <div class="info-row"><span class="label">Organisme :</span> ${bookingData.organizationName}</div>
              <div class="info-row"><span class="label">Événement :</span> ${bookingData.eventTitle}</div>
              <div class="info-row"><span class="label">Description :</span> ${bookingData.eventDescription}</div>
              <div class="info-row"><span class="label">Espace :</span> ${bookingData.spaceName}</div>
              <div class="info-row"><span class="label">Date de début :</span> ${new Date(bookingData.startDate).toLocaleDateString('fr-FR')} à ${bookingData.startTime}</div>
              <div class="info-row"><span class="label">Date de fin :</span> ${new Date(bookingData.endDate).toLocaleDateString('fr-FR')} à ${bookingData.endTime}</div>
              <div class="info-row"><span class="label">Nombre de participants :</span> ${bookingData.expectedAttendees}</div>
              
              <h3>Informations de contact</h3>
              <div class="info-row"><span class="label">Email :</span> ${bookingData.userEmail}</div>
              <div class="info-row"><span class="label">Téléphone :</span> ${bookingData.contactPhone}</div>
              <div class="info-row"><span class="label">Adresse :</span> ${bookingData.contactAddress}, ${bookingData.contactCity}, ${bookingData.contactCountry}</div>
              
              <div class="alert">
                <strong>Prochaines étapes :</strong>
                <ul>
                  <li>Notre équipe vérifiera la disponibilité de l'espace demandé</li>
                  <li>Vous serez contacté dans un délai de 2 à 3 jours ouvrables</li>
                  <li>Un email de confirmation vous sera envoyé une fois votre demande approuvée</li>
                </ul>
              </div>
              
              <p>Pour toute question, contactez-nous à <a href="mailto:reservations@bnrm.ma">reservations@bnrm.ma</a></p>
            </div>
            
            <div class="footer">
              <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong></p>
              <p>Rabat, Maroc</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email au client using unified SMTP
    const clientResult = await sendEmail({
      to: bookingData.userEmail,
      subject: "Demande de réservation – Activités culturelles BNRM",
      html: clientEmailHtml
    });

    console.log("[BOOKING-CONFIRM] Client email result:", clientResult);

    // Email admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nouvelle demande de réservation</h1>
            </div>
            
            <div class="content">
              <p><strong>Référence :</strong> ${bookingData.bookingId.slice(0, 8).toUpperCase()}</p>
              
              <h2>Informations du demandeur</h2>
              <div class="info-row"><span class="label">Nom :</span> ${bookingData.userName}</div>
              <div class="info-row"><span class="label">Email :</span> ${bookingData.userEmail}</div>
              <div class="info-row"><span class="label">Téléphone :</span> ${bookingData.contactPhone}</div>
              <div class="info-row"><span class="label">Organisme :</span> ${bookingData.organizationName}</div>
              
              <h2>Détails de l'événement</h2>
              <div class="info-row"><span class="label">Titre :</span> ${bookingData.eventTitle}</div>
              <div class="info-row"><span class="label">Description :</span> ${bookingData.eventDescription}</div>
              <div class="info-row"><span class="label">Espace demandé :</span> ${bookingData.spaceName}</div>
              <div class="info-row"><span class="label">Date/Heure :</span> ${new Date(bookingData.startDate).toLocaleDateString('fr-FR')} ${bookingData.startTime} - ${new Date(bookingData.endDate).toLocaleDateString('fr-FR')} ${bookingData.endTime}</div>
              <div class="info-row"><span class="label">Participants :</span> ${bookingData.expectedAttendees}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer email admin using unified SMTP
    const SMTP_FROM = Deno.env.get("SMTP_FROM");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const adminEmail = SMTP_FROM || SMTP_USER || "useryouness@gmail.com";
    
    const adminResult = await sendEmail({
      to: adminEmail,
      subject: `[BNRM] Nouvelle réservation - ${bookingData.eventTitle}`,
      html: adminEmailHtml
    });

    console.log("[BOOKING-CONFIRM] Admin email result:", adminResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        clientEmailSent: clientResult.success,
        clientMethod: clientResult.method,
        adminEmailSent: adminResult.success,
        adminMethod: adminResult.method
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[BOOKING-CONFIRM] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: error.toString() }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
