import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { sendEmail } from "../_shared/smtp-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveRequest {
  request_id: string;
  professional_type: string;
}

const getProfessionalTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    editor: "Éditeur",
    printer: "Imprimeur",
    producer: "Producteur",
    distributor: "Distributeur"
  };
  return labels[type] || type;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

    const syncProfessionalDirectoryEntry = async (args: {
      supabaseAdmin: any;
      professionalType: string;
      companyName: string;
      registrationData: any;
    }) => {
      const { supabaseAdmin, professionalType, companyName, registrationData } = args;
      const name = normalizeName(companyName || "");
      if (!name) return;

      const common = {
        name,
        city: registrationData?.city ?? null,
        country: registrationData?.country ?? "Maroc",
        address: registrationData?.address ?? null,
        phone: registrationData?.phone ?? null,
        email: registrationData?.email ?? registrationData?.contact_email ?? null,
        google_maps_link: registrationData?.google_maps_link ?? null,
        is_validated: true, // Mark as validated so it appears in autocomplete
        deleted_at: null, // Ensure not marked as deleted
        updated_at: new Date().toISOString(),
      };

      // Note: 'editor' entries live in the 'publishers' table (used by legal deposit forms).
      const tableByType: Record<string, string> = {
        editor: "publishers",
        printer: "printers",
        producer: "producers",
        distributor: "distributors",
      };

      const table = tableByType[professionalType];
      if (!table) return;

      console.log("Directory sync start:", { table, name, professionalType });

      // Try to find an existing entry by name (case-insensitive exact match)
      // Use .limit(1) instead of .maybeSingle() to avoid errors when duplicates exist
      const { data: existingRows, error: findError } = await supabaseAdmin
        .from(table)
        .select("id, name")
        .ilike("name", name)
        .limit(1);

      if (findError) {
        console.error("Directory sync find error:", { table, name, findError });
        // Don't throw - log warning and continue with approval process
        console.warn("Directory sync skipped due to find error, continuing with approval");
        return;
      }

      const existing = existingRows?.[0];

      if (existing?.id) {
        const { error: updateError } = await supabaseAdmin
          .from(table)
          .update(common)
          .eq("id", existing.id);

        if (updateError) {
          console.error("Directory sync update error:", { table, id: existing.id, updateError });
          // Don't throw - log warning and continue
          console.warn("Directory sync update failed, continuing with approval");
          return;
        }

        console.log("Directory sync updated:", { table, id: existing.id, name });
        return;
      }

      const insertPayload = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...common,
      };

      const { error: insertError } = await supabaseAdmin.from(table).insert(insertPayload);

      if (insertError) {
        console.error("Directory sync insert error:", { table, name, insertError });
        // Don't throw - log warning and continue
        console.warn("Directory sync insert failed, continuing with approval");
        return;
      }

      console.log("Directory sync inserted:", { table, name });
    };

    const resolvePublicSiteUrl = () => {
      const raw =
        Deno.env.get("SITE_URL") ||
        Deno.env.get("PUBLIC_SITE_URL") ||
        "https://bnrm-dev.digiup.ma";

      return raw.trim().replace(/\/$/, "");
    };

    const { request_id, professional_type }: ApproveRequest = await req.json();

    console.log("Approving professional request:", { request_id, professional_type });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer la demande
    const { data: request, error: fetchError } = await supabaseAdmin
      .from("professional_registration_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !request) {
      console.error("Request not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Demande non trouvée" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Request found:", { 
      id: request.id, 
      user_id: request.user_id, 
      email: request.registration_data?.email,
      status: request.status
    });

    let userId = request.user_id;
    let userEmail = request.registration_data?.email || request.registration_data?.contact_email;
    let passwordResetLink: string | null = null;
    let isNewUser = false;

    // Si user_id est null, créer ou récupérer le compte utilisateur
    if (!userId) {
      if (!userEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "Aucun email trouvé dans la demande" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Processing user for email:", userEmail);

      // Vérifier si un utilisateur existe déjà avec cet email
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      const existingUser = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
      );

      if (existingUser) {
        // L'utilisateur existe déjà, utiliser son ID
        userId = existingUser.id;
        console.log("User already exists, using existing ID:", userId);

        // Unban the user if they were previously deleted/banned
        if (existingUser.banned_until || existingUser.user_metadata?.banned) {
          console.log("User was previously banned, unbanning...");
          const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: 'none',
            user_metadata: { banned: false },
          });
          if (unbanError) {
            console.error("Error unbanning user:", unbanError);
          } else {
            console.log("User unbanned successfully");
          }
        }

        // On génère quand même un lien de récupération pour les utilisateurs existants
        isNewUser = false;
      } else {
        // Créer un nouvel utilisateur
        console.log("Creating new user for email:", userEmail);

        // Générer un mot de passe temporaire aléatoire
        const tempPassword = crypto.randomUUID() + "Aa1!";

        // Créer l'utilisateur avec l'API admin
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: request.registration_data?.contact_name || request.registration_data?.name_fr || request.company_name,
            last_name: "",
            professional_type: professional_type,
            company_name: request.company_name,
          }
        });

        if (createError) {
          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({ success: false, error: `Erreur création utilisateur: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = newUser.user.id;
        console.log("User created successfully:", userId);
        isNewUser = true;
      }

      // Mettre à jour la demande avec le user_id
      const { error: updateReqError } = await supabaseAdmin
        .from("professional_registration_requests")
        .update({ user_id: userId })
        .eq("id", request_id);

      if (updateReqError) {
        console.error("Error updating request with user_id:", updateReqError);
      }

      // Créer ou mettre à jour le profil utilisateur
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          user_id: userId,
          first_name: request.registration_data?.contact_name || request.registration_data?.name_fr || request.company_name || "Professionnel",
          last_name: request.registration_data?.name_ar || "",
          phone: request.registration_data?.phone,
          institution: request.company_name,
          is_approved: true,
          account_status: "active",
        }, { onConflict: "user_id" });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }

    // TOUJOURS générer le lien de réinitialisation de mot de passe (pour nouveaux et existants)
    if (userEmail) {
      const siteUrl = resolvePublicSiteUrl();
      const redirectTo = `${siteUrl}/auth?reset=true`;

      console.log("Generating recovery link with redirectTo:", redirectTo);

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userEmail,
        options: {
          redirectTo,
        },
      });

      if (linkError) {
        console.error("Error generating recovery link:", linkError);
      } else if (linkData?.properties?.action_link) {
        // Le lien brut pointe vers Supabase (xxx.supabase.co/auth/v1/verify?...).
        // On le transforme pour qu'il pointe directement vers le site avec les tokens dans le hash.
        const rawLink = linkData.properties.action_link;
        console.log("Raw action_link from Supabase:", rawLink);
        
        try {
          const linkUrl = new URL(rawLink);
          const token = linkUrl.searchParams.get("token");
          const type = linkUrl.searchParams.get("type");
          
          if (token && type) {
            // Construire le lien direct vers le site avec les tokens dans le hash
            // Format: https://site.com/auth?reset=true#access_token=...&type=recovery
            passwordResetLink = `${siteUrl}/auth?reset=true#token=${encodeURIComponent(token)}&type=${type}`;
            console.log("Transformed password reset link for direct access");
          } else {
            // Fallback: utiliser le lien brut
            passwordResetLink = rawLink;
            console.log("Using raw link (no token/type found)");
          }
        } catch (parseError) {
          console.error("Error parsing action_link:", parseError);
          passwordResetLink = rawLink;
        }
      }
    }

    // Convertir le type professionnel en rôle
    const roleMap: Record<string, string> = {
      editor: "editor",
      printer: "printer",
      producer: "producer",
      distributor: "distributor"
    };
    const userRole = roleMap[professional_type];

    if (!userRole) {
      return new Response(
        JSON.stringify({ success: false, error: "Type professionnel invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupérer l'admin qui fait l'action (depuis le token JWT)
    const authHeader = req.headers.get("Authorization");
    let adminId: string | null = null;
    if (authHeader) {
      const { data: { user: adminUser } } = await supabaseAdmin.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      adminId = adminUser?.id || null;
    }

    // IMPORTANT: For every approved registration, also sync the corresponding directory table
    // so it appears everywhere the system reads from publishers/printers/producers/distributors.
    // Wrapped in try-catch to ensure approval continues even if directory sync fails
    try {
      await syncProfessionalDirectoryEntry({
        supabaseAdmin,
        professionalType: professional_type,
        companyName: request.company_name,
        registrationData: request.registration_data,
      });
    } catch (syncError) {
      console.error("Directory sync failed but continuing with approval:", syncError);
    }

    // Mettre à jour la demande comme approuvée
    const { error: updateError } = await supabaseAdmin
      .from("professional_registration_requests")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", request_id);

    if (updateError) {
      console.error("Error updating request status:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Erreur mise à jour: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mettre à jour le profil comme approuvé
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (profileUpdateError) {
      console.error("Error updating profile approval:", profileUpdateError);
    }

    // Attribuer le rôle à l'utilisateur
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: userRole,
        granted_by: adminId,
        granted_at: new Date().toISOString()
      }, { onConflict: "user_id,role" });

    if (roleError) {
      console.error("Error assigning role:", roleError);
    }

    // Marquer l'invitation comme utilisée (si elle existe)
    if (request.invitation_id) {
      await supabaseAdmin
        .from("professional_invitations")
        .update({ status: "used", updated_at: new Date().toISOString() })
        .eq("id", request.invitation_id);
    }

    // Envoyer l'email de notification au demandeur
    if (userEmail) {
      const siteUrl = resolvePublicSiteUrl();
      const professionalTypeLabel = getProfessionalTypeLabel(professional_type);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BNRM - Bibliothèque Nationale</h1>
              <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">Royaume du Maroc</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background-color: #48bb78; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 30px;">✓</span>
                </div>
                <h2 style="color: #1e3a5f; margin: 0; font-size: 22px;">Demande Approuvée</h2>
              </div>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Bonjour,
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Nous avons le plaisir de vous informer que votre demande d'inscription en tant que 
                <strong style="color: #1e3a5f;">${professionalTypeLabel}</strong> auprès de la Bibliothèque Nationale du Royaume du Maroc a été <strong style="color: #48bb78;">approuvée</strong>.
              </p>
              
              <div style="background-color: #f7fafc; border-left: 4px solid #1e3a5f; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e3a5f; margin: 0 0 10px 0; font-size: 16px;">Informations du compte :</h3>
                <p style="color: #4a5568; margin: 5px 0; font-size: 14px;"><strong>Email :</strong> ${userEmail}</p>
                <p style="color: #4a5568; margin: 5px 0; font-size: 14px;"><strong>Type de compte :</strong> ${professionalTypeLabel}</p>
                <p style="color: #4a5568; margin: 5px 0; font-size: 14px;"><strong>Entreprise :</strong> ${request.company_name}</p>
              </div>
              
              ${passwordResetLink ? `
              <div style="background-color: #fffaf0; border: 1px solid #ed8936; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #c05621; margin: 0 0 10px 0; font-size: 16px;">⚠️ Action requise : Créez votre mot de passe</h3>
                <p style="color: #744210; font-size: 14px; margin-bottom: 15px;">
                  Pour accéder à votre espace professionnel, vous devez créer votre mot de passe en cliquant sur le bouton ci-dessous.
                </p>
                <div style="text-align: center;">
                  <a href="${passwordResetLink}" style="display: inline-block; background-color: #1e3a5f; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; mso-padding-alt: 14px 30px;">
                    Créer mon mot de passe
                  </a>
                </div>
                <p style="color: #744210; font-size: 12px; margin-top: 15px; text-align: center;">
                  Ce lien est valide pendant 24 heures.
                </p>
                <p style="color: #744210; font-size: 11px; margin-top: 10px; word-break: break-all;">
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                  <a href="${passwordResetLink}" style="color: #1e3a5f; text-decoration: underline;">${passwordResetLink}</a>
                </p>
              </div>
              ` : `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${siteUrl}/auth" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accéder à mon espace
                </a>
              </div>
              `}
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 25px;">
                Une fois connecté, vous pourrez :
              </p>
              <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                <li>Effectuer vos dépôts légaux en ligne</li>
                <li>Suivre l'état de vos demandes</li>
                <li>Gérer vos informations professionnelles</li>
                <li>Accéder à l'historique de vos déclarations</li>
              </ul>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                Bibliothèque Nationale du Royaume du Maroc
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log("Sending approval notification email to:", userEmail);
      
      const emailResult = await sendEmail({
        to: userEmail,
        subject: `✅ Votre demande d'inscription ${professionalTypeLabel} a été approuvée - BNRM`,
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log("Approval email sent successfully via", emailResult.method);
      } else {
        console.error("Failed to send approval email:", emailResult.error);
      }
    }

    console.log("Professional registration approved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        user_email: userEmail,
        password_reset_link: passwordResetLink,
        message: "Demande approuvée avec succès"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in approve-professional:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
