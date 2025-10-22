import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import jsPDF from "npm:jspdf@2.5.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(0, 43, 69); // #002B45
  doc.text("Bibliothèque Nationale du Royaume du Maroc", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Confirmation de visite guidée", 105, 35, { align: "center" });
  
  // Ligne de séparation
  doc.setDrawColor(212, 175, 55); // #D4AF37
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Informations de la visite
  doc.setFontSize(12);
  doc.setTextColor(51, 51, 51); // #333333
  
  let yPos = 60;
  const lineHeight = 10;
  
  doc.setFont(undefined, "bold");
  doc.text("Détails de votre visite :", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += lineHeight * 1.5;
  doc.text(`Nom : ${data.nom}`, 20, yPos);
  
  yPos += lineHeight;
  doc.text(`Date : ${new Date(data.slotDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`, 20, yPos);
  
  yPos += lineHeight;
  doc.text(`Heure : ${data.slotTime.substring(0, 5)}`, 20, yPos);
  
  yPos += lineHeight;
  doc.text(`Langue : ${data.langue}`, 20, yPos);
  
  yPos += lineHeight;
  doc.text(`Nombre de visiteurs : ${data.nbVisiteurs}`, 20, yPos);
  
  // Informations pratiques
  yPos += lineHeight * 2;
  doc.setFont(undefined, "bold");
  doc.text("Informations pratiques :", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += lineHeight * 1.5;
  doc.text("• Durée de la visite : environ 45 minutes", 20, yPos);
  
  yPos += lineHeight;
  doc.text("• Veuillez arriver 10 minutes avant l'heure prévue", 20, yPos);
  
  yPos += lineHeight;
  doc.text("• Présentez-vous à l'accueil avec cette confirmation", 20, yPos);
  
  yPos += lineHeight;
  doc.text("• En cas d'empêchement, merci de nous prévenir 24h à l'avance", 20, yPos);
  
  // Adresse et contact
  yPos += lineHeight * 2;
  doc.setFont(undefined, "bold");
  doc.text("Adresse :", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += lineHeight * 1.5;
  doc.text("Bibliothèque Nationale du Royaume du Maroc", 20, yPos);
  
  yPos += lineHeight;
  doc.text("Avenue Ibn Batouta, Rabat", 20, yPos);
  
  yPos += lineHeight;
  doc.text("Tél: +212 5 37 77 18 03", 20, yPos);
  
  // Pied de page
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Numéro de confirmation : " + data.bookingId.substring(0, 8),
    105,
    280,
    { align: "center" }
  );
  
  return doc.output("arraybuffer");
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: VisitConfirmationRequest = await req.json();
    console.log("Sending visit confirmation to:", requestData.email);

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

    // Envoyer l'email avec le PDF en pièce jointe
    const emailResponse = await resend.emails.send({
      from: "BNRM Activités Culturelles <onboarding@resend.dev>",
      to: [requestData.email],
      subject: "Confirmation de votre visite guidée - BNRM",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #002B45; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Bibliothèque Nationale du Royaume du Maroc</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #002B45; margin-top: 0;">Bonjour ${requestData.nom},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Votre réservation pour la visite guidée du <strong>${formattedDate}</strong> 
              à <strong>${requestData.slotTime.substring(0, 5)}</strong> a bien été enregistrée.
            </p>
            
            <div style="background-color: white; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Langue :</strong> ${requestData.langue}</p>
              <p style="margin: 5px 0;"><strong>Nombre de visiteurs :</strong> ${requestData.nbVisiteurs}</p>
              <p style="margin: 5px 0;"><strong>Durée :</strong> environ 45 minutes</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Nous vous remercions de votre intérêt pour la Bibliothèque Nationale du Royaume du Maroc.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Vous trouverez ci-joint votre confirmation de réservation en PDF. 
              Merci de la présenter à l'accueil le jour de votre visite.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>Adresse :</strong> Avenue Ibn Batouta, Rabat
              </p>
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>Téléphone :</strong> +212 5 37 77 18 03
              </p>
            </div>
          </div>
          
          <div style="background-color: #002B45; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Bibliothèque Nationale du Royaume du Maroc</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "confirmation-visite-bnrm.pdf",
          content: pdfBase64,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-visit-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
