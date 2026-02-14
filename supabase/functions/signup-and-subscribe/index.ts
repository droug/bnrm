import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Client with anon key for signUp (so auth hooks fire normally)
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey);

    // Admin client for profile + registration inserts
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Create the user account
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    });

    if (signUpError) {
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signUpData.user) {
      return new Response(
        JSON.stringify({ error: "Impossible de créer le compte." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = signUpData.user.id;
    console.log("User created:", userId);

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
