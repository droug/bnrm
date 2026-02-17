import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  editorEmail: string;
  editorName: string;
  editorPhone?: string;
  editorId: string;
  notifyByPhone?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { editorEmail, editorName, editorPhone, editorId, notifyByPhone } =
      (await req.json()) as InvitationRequest;

    if (!editorEmail || !editorName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[EDITOR-INVITATION] Sending invitation to: ${editorEmail}`);

    // Build registration URL with correct parameter and pre-filled email
    let baseUrl = Deno.env.get("SITE_URL") || "https://bnrm-dev.digiup.ma";
    // Remove trailing slash to prevent double slashes in the URL
    baseUrl = baseUrl.replace(/\/+$/, "");
    const encodedEmail = encodeURIComponent(editorEmail);
    const encodedName = encodeURIComponent(editorName);
    const encodedPhone = editorPhone ? encodeURIComponent(editorPhone) : "";
    const registrationUrl = `${baseUrl}/signup?type=editor&ref=${editorId}&email=${encodedEmail}&name=${encodedName}${encodedPhone ? `&phone=${encodedPhone}` : ""}`;

    // Additional phone notification section in email
    const phoneNotificationSection = notifyByPhone && editorPhone ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>📞 Contact téléphonique :</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 14px;">Vous pouvez également nous contacter au : <strong>${editorPhone}</strong></p>
    </div>
    ` : "";

    // Email content
    const emailSubject = "Invitation à rejoindre la plateforme BNRM - Dépôt Légal";
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Bibliothèque Nationale du Royaume du Maroc</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Plateforme de Dépôt Légal</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1a365d; margin-top: 0;">Bonjour ${editorName},</h2>
    
    <p>Vous avez été mentionné comme éditeur dans le cadre d'une déclaration de dépôt légal sur la plateforme de la Bibliothèque Nationale du Royaume du Maroc.</p>
    
    <p>Pour pouvoir confirmer les déclarations qui vous concernent et accéder à votre espace professionnel, nous vous invitons à créer votre compte sur notre plateforme.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
          <td style="background: #1a365d; border-radius: 6px;">
            <a href="${registrationUrl}" 
               target="_blank"
               style="color: #ffffff; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              Créer mon compte Éditeur
            </a>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 10px 0 20px 0;">
      <p style="font-size: 12px; color: #666;">Si le bouton ne s'affiche pas, copiez ce lien dans votre navigateur :</p>
      <p style="font-size: 12px; color: #1a365d; word-break: break-all;">${registrationUrl}</p>
    </div>
    
    ${phoneNotificationSection}
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Important :</strong> Votre inscription sera soumise à validation dans un délai de 10 jours ouvrables.</p>
    </div>
    
    <p>En créant votre compte, vous pourrez :</p>
    <ul style="color: #555;">
      <li>Confirmer les déclarations de dépôt légal vous concernant</li>
      <li>Soumettre vos propres déclarations de dépôt légal</li>
      <li>Demander des numéros ISBN/ISSN</li>
      <li>Suivre l'état de vos demandes</li>
      <li>Recevoir des notifications importantes</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
    
    <p style="font-size: 12px; color: #666; margin-bottom: 0;">
      Cet email a été envoyé automatiquement par la plateforme de dépôt légal de la BNRM.<br>
      Si vous n'êtes pas concerné par ce message, veuillez l'ignorer.
    </p>
  </div>
</body>
</html>
    `.trim();

    // Send email using unified SMTP client
    const result = await sendEmail({
      to: editorEmail,
      subject: emailSubject,
      html: emailBody,
    });

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!result.success) {
      console.error("[EDITOR-INVITATION] Email sending failed:", result.error);
      
      // Log the failed invitation for manual follow-up
      await supabase.from("activity_logs").insert({
        action: "editor_invitation_pending",
        resource_type: "publisher",
        resource_id: editorId,
        details: {
          email: editorEmail,
          name: editorName,
          phone: editorPhone || null,
          notifyByPhone: notifyByPhone || false,
          reason: result.error || "Email delivery failed, manual follow-up required",
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: "Email queued for manual delivery",
          error: result.error,
          phoneNotificationRequired: notifyByPhone && editorPhone ? editorPhone : null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log successful invitation
    await supabase.from("activity_logs").insert({
      action: "editor_invitation_sent",
      resource_type: "publisher",
      resource_id: editorId,
      details: {
        email: editorEmail,
        name: editorName,
        phone: editorPhone || null,
        notifyByPhone: notifyByPhone || false,
        method: result.method,
        messageId: result.messageId,
      },
    });

    console.log(`[EDITOR-INVITATION] Email sent successfully via ${result.method}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
        method: result.method,
        messageId: result.messageId,
        phoneNotificationRequired: notifyByPhone && editorPhone ? editorPhone : null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-editor-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
