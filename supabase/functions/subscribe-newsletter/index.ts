import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSubscribeRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: NewsletterSubscribeRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      throw new Error("Email invalide");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if email already subscribed
    const { data: existing } = await supabaseClient
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ message: "Vous êtes déjà abonné à notre newsletter" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Reactivate subscription
        await supabaseClient
          .from("newsletter_subscribers")
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
    } else {
      // Create new subscription
      await supabaseClient
        .from("newsletter_subscribers")
        .insert({
          email,
          name: name || null,
          is_active: true,
          subscribed_at: new Date().toISOString(),
        });
    }

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "BNRM <newsletter@bnrm.ma>",
      to: [email],
      subject: "Bienvenue à la newsletter BNRM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue à la newsletter BNRM !</h1>
            </div>
            <div class="content">
              <h2>Merci de votre abonnement ${name ? name : ""} !</h2>
              <p>Nous sommes ravis de vous compter parmi nos abonnés.</p>
              <p>Vous recevrez désormais nos actualités, nos nouvelles acquisitions et nos événements culturels directement dans votre boîte mail.</p>
              
              <h3>Ce que vous recevrez :</h3>
              <ul>
                <li>📚 Nouvelles acquisitions et collections</li>
                <li>🎭 Événements culturels et expositions</li>
                <li>📰 Actualités de la bibliothèque</li>
                <li>🎓 Ressources éducatives exclusives</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")}/digital-library" class="button">
                  Découvrir notre bibliothèque numérique
                </a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Vous recevez cet email car vous vous êtes abonné à la newsletter de la Bibliothèque Nationale du Royaume du Maroc.
              </p>
            </div>
            <div class="footer">
              <p>Bibliothèque Nationale du Royaume du Maroc</p>
              <p>Avenue Allal El Fassi, Hay Ryad - Rabat</p>
              <p>
                <a href="#" style="color: #1e40af;">Se désabonner</a> | 
                <a href="#" style="color: #1e40af;">Gérer mes préférences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Newsletter subscription email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Merci pour votre abonnement ! Un email de confirmation vous a été envoyé." 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur lors de l'abonnement" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
