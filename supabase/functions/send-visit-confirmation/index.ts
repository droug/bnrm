import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { jsPDF } from "npm:jspdf@2.5.1";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisitConfirmationRequest {
  bookingId: string;
  email: string;
  nom: string;
  slotDate: string;
  slotTime: string;
  langue: string;
  nbVisiteurs: number;
}

const generateConfirmationPDF = (data: VisitConfirmationRequest): Uint8Array => {
  const doc = new jsPDF();
  
  // En-tête avec logo BNRM
  doc.setFillColor(0, 43, 69);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setFontSize(24);
  doc.setTextColor(212, 175, 55);
  doc.setFont(undefined, "bold");
  doc.text("BNRM", 105, 15, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "normal");
  doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 25, { align: "center" });
  
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Confirmation de visite guidée", 105, 35, { align: "center" });
  
  // Ligne de séparation dorée
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(20, 48, 190, 48);
  
  // Message de confirmation
  doc.setFontSize(12);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, "normal");
  
  let yPos = 60;
  const lineHeight = 8;
  
  doc.text(`Bonjour ${data.nom},`, 20, yPos);
  
  yPos += lineHeight * 2;
  const formattedDate = new Date(data.slotDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  doc.text(`Votre réservation pour la visite guidée du ${formattedDate}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`à ${data.slotTime.substring(0, 5)} a bien été enregistrée.`, 20, yPos);
  
  // Encadré avec les détails
  yPos += lineHeight * 2;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPos, 170, 35, 3, 3, "S");
  
  yPos += 10;
  doc.setFont(undefined, "bold");
  doc.text("Détails de votre visite :", 25, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += lineHeight * 1.5;
  doc.text(`Langue : ${data.langue.charAt(0).toUpperCase() + data.langue.slice(1)}`, 25, yPos);
  
  yPos += lineHeight;
  doc.text(`Nombre de visiteurs : ${data.nbVisiteurs}`, 25, yPos);
  
  yPos += lineHeight;
  doc.text(`Durée : environ 45 minutes`, 25, yPos);
  
  // Message de remerciement
  yPos += lineHeight * 3;
  doc.text("Nous vous remercions de votre intérêt pour la Bibliothèque Nationale", 20, yPos);
  yPos += lineHeight;
  doc.text("du Royaume du Maroc.", 20, yPos);
  
  // Informations pratiques
  yPos += lineHeight * 2.5;
  doc.setFont(undefined, "bold");
  doc.setFontSize(13);
  doc.text("Informations pratiques", 20, yPos);
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  
  yPos += lineHeight * 1.5;
  doc.text("• Veuillez arriver 10 minutes avant l'heure prévue", 25, yPos);
  
  yPos += lineHeight;
  doc.text("• Présentez-vous à l'accueil avec cette confirmation", 25, yPos);
  
  yPos += lineHeight;
  doc.text("• En cas d'empêchement, merci de nous prévenir 24h à l'avance", 25, yPos);
  
  // Adresse et contact
  yPos += lineHeight * 2.5;
  doc.setFont(undefined, "bold");
  doc.setFontSize(13);
  doc.text("Adresse", 20, yPos);
  doc.setFont(undefined, "normal");
  doc.setFontSize(11);
  
  yPos += lineHeight * 1.5;
  doc.text("Bibliothèque Nationale du Royaume du Maroc", 20, yPos);
  
  yPos += lineHeight;
  doc.text("Avenue Ibn Batouta, Rabat", 20, yPos);
  
  yPos += lineHeight;
  doc.text("Tél : +212 5 37 77 18 03", 20, yPos);
  
  yPos += lineHeight;
  doc.text("Email : contact@bnrm.ma", 20, yPos);
  
  // Pied de page avec numéro de confirmation
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 270, 210, 27, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Numéro de confirmation : ${data.bookingId.substring(0, 8).toUpperCase()}`,
    105,
    280,
    { align: "center" }
  );
  
  doc.setFontSize(8);
  doc.text(
    `© ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc - Tous droits réservés`,
    105,
    285,
    { align: "center" }
  );
  
  return doc.output("arraybuffer");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: VisitConfirmationRequest = await req.json();
    console.log("[VISIT-CONFIRM] Sending visit confirmation to:", requestData.email);

    // Générer le PDF
    const pdfBuffer = generateConfirmationPDF(requestData);
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Formater la date
    const formattedDate = new Date(requestData.slotDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #002B45 0%, #003d5c 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Bibliothèque Nationale du Royaume du Maroc</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Confirmation de réservation</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9fafb;">
          <h2 style="color: #002B45; margin-top: 0; font-size: 20px;">Bonjour ${requestData.nom},</h2>
          
          <p style="font-size: 16px; line-height: 1.8; color: #374151; margin: 20px 0;">
            Votre réservation pour la visite guidée du <strong style="color: #002B45;">${formattedDate}</strong> 
            à <strong style="color: #002B45;">${requestData.slotTime.substring(0, 5)}</strong> a bien été enregistrée.
          </p>
          
          <div style="background-color: white; padding: 25px; border-left: 5px solid #D4AF37; margin: 25px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #002B45; font-size: 16px;">📋 Détails de votre visite</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Langue :</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 14px; text-align: right;">${requestData.langue.charAt(0).toUpperCase() + requestData.langue.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nombre de visiteurs :</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 14px; text-align: right;">${requestData.nbVisiteurs}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Durée :</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-size: 14px; text-align: right;">environ 45 minutes</td>
              </tr>
            </table>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #D4AF37;">
            <p style="margin: 0; font-size: 15px; color: #78350f; line-height: 1.6;">
              📎 <strong>Vous trouverez ci-joint votre confirmation de réservation en PDF.</strong><br/>
              Merci de la présenter à l'accueil le jour de votre visite.
            </p>
          </div>
          
          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 12px 0; color: #075985; font-size: 15px;">ℹ️ Informations pratiques</h3>
            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px; line-height: 1.8;">
              <li>Veuillez arriver 10 minutes avant l'heure prévue</li>
              <li>Présentez-vous à l'accueil avec cette confirmation</li>
              <li>En cas d'empêchement, merci de nous prévenir 24h à l'avance</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <h3 style="color: #002B45; font-size: 16px; margin: 0 0 15px 0;">📍 Contact</h3>
            <p style="font-size: 14px; color: #4b5563; margin: 5px 0;"><strong>Adresse :</strong> Avenue Ibn Batouta, Rabat</p>
            <p style="font-size: 14px; color: #4b5563; margin: 5px 0;"><strong>Téléphone :</strong> +212 5 37 77 18 03</p>
            <p style="font-size: 14px; color: #4b5563; margin: 5px 0;"><strong>Email :</strong> contact@bnrm.ma</p>
          </div>
        </div>
        
        <div style="background-color: #002B45; color: white; padding: 25px 30px; text-align: center;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">
            Numéro de confirmation : <strong>${requestData.bookingId.substring(0, 8).toUpperCase()}</strong>
          </p>
          <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.7;">
            © ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc
          </p>
        </div>
      </div>
    `;

    // Use unified SMTP client
    const result = await sendEmail({
      to: requestData.email,
      subject: "Confirmation de votre réservation de visite guidée – BNRM",
      html: emailHtml,
      attachments: [{ filename: "confirmation-visite-bnrm.pdf", content: pdfBase64 }]
    });

    console.log("[VISIT-CONFIRM] Email result:", result);

    return new Response(JSON.stringify({ success: result.success, data: result }), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-visit-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, details: error.toString() }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
