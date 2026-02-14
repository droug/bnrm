import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      institution,
      cnie,
      region,
      ville,
      address,
      additionalInfo,
      serviceId,
      tariffId,
      isFreeService,
      selectedTariffInfo,
      isPageBasedService,
      pageCount,
      selectedManuscript,
    } = await req.json();

    if (!email || !password || !serviceId) {
      return new Response(
        JSON.stringify({ error: "Email, mot de passe et service sont requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Admin client for user creation, profile + registration inserts
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Try to create the user account; if already exists, look them up
    let userId: string;
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    });

    if (createError) {
      // If user already exists, find them and reuse
      if (createError.message.includes("already been registered")) {
        const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
        if (listError) {
          return new Response(
            JSON.stringify({ error: "Erreur lors de la recherche de l'utilisateur existant." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const existingUser = listData.users.find((u: { email?: string }) => u.email === email);
        if (!existingUser) {
          return new Response(
            JSON.stringify({ error: "Un compte avec cet email existe déjà mais est introuvable." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        userId = existingUser.id;
        console.log("Existing user found:", userId);
      } else {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (!createData.user) {
      return new Response(
        JSON.stringify({ error: "Impossible de créer le compte." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      userId = createData.user.id;
      console.log("User created:", userId);
    }

    // 2. Upsert profile using admin client (bypasses RLS)
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          first_name: firstName || "",
          last_name: lastName || "",
          phone: phone || "",
          institution: institution || "",
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      console.error("Profile error:", profileError);
      // Non-blocking: profile will be created by trigger or later
    }

    // 3. Create service registration using admin client
    const registrationData: Record<string, unknown> = {
      user_id: userId,
      service_id: serviceId,
      tariff_id: tariffId || null,
      status: isFreeService ? "active" : "pending",
      is_paid: !!isFreeService,
      registration_data: {
        firstName,
        lastName,
        cnie,
        email,
        phone,
        region,
        ville,
        address,
        institution,
        additionalInfo,
        formuleType: selectedTariffInfo || "Non spécifié",
        ...(isPageBasedService && { pageCount }),
        ...(selectedManuscript && {
          manuscriptId: selectedManuscript.id,
          manuscriptTitle: selectedManuscript.title,
          manuscriptCote: selectedManuscript.cote,
        }),
      },
    };

    const { data: registration, error: regError } = await adminClient
      .from("service_registrations")
      .insert(registrationData)
      .select()
      .single();

    if (regError) {
      console.error("Registration error:", regError);
      return new Response(
        JSON.stringify({ error: "Compte créé mais erreur lors de l'inscription au service: " + regError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Send confirmation email via unified SMTP
    const recipientName = [firstName, lastName].filter(Boolean).join(" ") || "Utilisateur";
    const serviceName = selectedTariffInfo || serviceId;
    
    try {
      const emailResult = await sendEmail({
        to: email,
        subject: "Inscription reçue - BNRM",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #002B45 0%, #004d7a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #002B45; border-radius: 4px; }
              .success-box { background: #e8f5e9; border-left-color: #4caf50; }
              h1 { margin: 0; font-size: 24px; }
              h2 { color: #002B45; margin-top: 0; }
              ul { padding-left: 20px; }
              li { margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bibliothèque Nationale du Royaume du Maroc</h1>
              </div>
              <div class="content">
                <h2>Bonjour ${recipientName},</h2>
                <p>Nous avons bien reçu votre demande d'inscription au service <strong>${serviceName}</strong> auprès de la Bibliothèque Nationale du Royaume du Maroc.</p>
                
                <div class="info-box success-box">
                  <h3>✅ Votre compte a été créé avec succès</h3>
                  <p>Votre demande d'abonnement est ${isFreeService ? "activée" : "en cours de traitement"}.</p>
                </div>
                
                <div class="info-box">
                  <h3>📋 Récapitulatif</h3>
                  <ul>
                    <li><strong>Email :</strong> ${email}</li>
                    <li><strong>Service :</strong> ${serviceName}</li>
                    <li><strong>Statut :</strong> ${isFreeService ? "Actif" : "En attente de validation"}</li>
                  </ul>
                </div>
                
                ${!isFreeService ? `
                <p>Votre abonnement sera activé après validation par notre équipe. Vous recevrez un email de confirmation.</p>
                ` : `
                <p>Votre abonnement est maintenant actif. Vous pouvez vous connecter et accéder aux services.</p>
                `}
                
                <p>En cas de questions, contactez-nous à <a href="mailto:contact@bnrm.ma">contact@bnrm.ma</a></p>
                
                <p>Cordialement,<br><strong>L'équipe de la BNRM</strong></p>
              </div>
              <div class="footer">
                <p><strong>Bibliothèque Nationale du Royaume du Maroc</strong></p>
                <p>Avenue Ibn Khaldoun, Rabat, Maroc</p>
                <p>Tél: +212 537 77 18 33 | Email: contact@bnrm.ma</p>
                <p><a href="https://www.bnrm.ma">www.bnrm.ma</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (emailResult.success) {
        console.log("Confirmation email sent:", emailResult.messageId);
      } else {
        console.error("Email sending failed (non-blocking):", emailResult.error);
      }
    } catch (emailErr) {
      console.error("Email error (non-blocking):", emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        registrationId: registration.id,
        message: "Compte créé et inscription enregistrée avec succès.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
