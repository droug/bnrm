import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveRequest {
  request_id: string;
  professional_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Si user_id est null, créer un nouveau compte utilisateur
    if (!userId) {
      if (!userEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "Aucun email trouvé dans la demande" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Creating new user for email:", userEmail);

      // Générer un mot de passe temporaire aléatoire
      const tempPassword = crypto.randomUUID() + "Aa1!";

      // Créer l'utilisateur avec l'API admin
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirm: true, // Marquer l'email comme confirmé
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

      // Mettre à jour la demande avec le user_id
      const { error: updateReqError } = await supabaseAdmin
        .from("professional_registration_requests")
        .update({ user_id: userId })
        .eq("id", request_id);

      if (updateReqError) {
        console.error("Error updating request with user_id:", updateReqError);
      }

      // Créer le profil utilisateur
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          user_id: userId,
          first_name: request.registration_data?.contact_name || request.registration_data?.name_fr || request.company_name || "Professionnel",
          last_name: request.registration_data?.name_ar || "",
          phone: request.registration_data?.phone,
          institution: request.company_name,
          is_approved: true,
        }, { onConflict: "user_id" });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      // Générer le lien de réinitialisation de mot de passe
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userEmail,
        options: {
          redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "")}.lovable.app/auth?reset=true`
        }
      });

      if (linkError) {
        console.error("Error generating recovery link:", linkError);
      } else if (linkData?.properties?.action_link) {
        passwordResetLink = linkData.properties.action_link;
        console.log("Password reset link generated");
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
