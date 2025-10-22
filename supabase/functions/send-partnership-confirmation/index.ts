import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  partnership_id: string;
  email: string;
  organisme: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partnership_id, email, organisme }: RequestBody = await req.json();

    console.log("Sending partnership confirmation email:", { partnership_id, email, organisme });

    // Créer le client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les détails de la demande
    const { data: partnership, error: fetchError } = await supabaseAdmin
      .from("partnerships")
      .select("*")
      .eq("id", partnership_id)
      .single();

    if (fetchError) {
      console.error("Error fetching partnership:", fetchError);
      throw new Error("Erreur lors de la récupération de la demande");
    }

    // Préparer l'email HTML
    const emailHtml = `
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
          .button { display: inline-block; padding: 12px 24px; background: #002B45; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
            <p style="margin: 0;">Accusé de réception - Demande de partenariat</p>
          </div>
          <div class="content">
            <h2 style="color: #002B45;">Bonjour ${organisme},</h2>
            
            <p>Votre demande de partenariat a bien été transmise à la <strong>Bibliothèque Nationale du Royaume du Maroc</strong>.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #002B45;">Référence de votre demande</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${partnership_id}</p>
            </div>
            
            <p>Elle sera examinée par le <strong>Département des Activités Culturelles</strong> dans les meilleurs délais.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #002B45;">Prochaines étapes</h3>
              <ul style="margin-bottom: 0;">
                <li>Notre équipe va examiner votre demande sous 5 jours ouvrables</li>
                <li>Vous recevrez un email de confirmation ou de demande de complément d'information</li>
                <li>En cas d'acceptation, nous vous contacterons pour finaliser les détails du partenariat</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">Vous pouvez nous contacter à tout moment pour toute question concernant votre demande.</p>
            
            <p style="margin-top: 30px;">Cordialement,<br>
            <strong>Le Département des Activités Culturelles</strong><br>
            Bibliothèque Nationale du Royaume du Maroc</p>
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

    // Utiliser Resend pour envoyer l'email (si configuré)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "BNRM Activités Culturelles <onboarding@resend.dev>",
          to: [email],
          subject: "Accusé de réception – Demande de partenariat BNRM",
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error("Resend error:", errorData);
        throw new Error("Erreur lors de l'envoi de l'email");
      }

      console.log("Email sent successfully via Resend");
    } else {
      console.log("RESEND_API_KEY not configured, email would have been sent to:", email);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmation envoyé",
        partnership_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-partnership-confirmation:", error);
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
