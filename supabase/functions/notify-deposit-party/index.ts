import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  partyId: string;
  requestId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partyId, requestId }: NotificationRequest = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer les informations de la partie
    const { data: party, error: partyError } = await supabaseAdmin
      .from("legal_deposit_parties")
      .select(`
        *,
        request:legal_deposit_requests(request_number, title),
        user:profiles(first_name, last_name)
      `)
      .eq("id", partyId)
      .single();

    if (partyError) throw partyError;

    // Récupérer l'email de l'utilisateur depuis auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      party.user_id
    );

    if (authError) throw authError;

    const userEmail = authData.user.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    const roleLabels: { [key: string]: string } = {
      editor: "Éditeur",
      printer: "Imprimeur",
      producer: "Producteur",
    };

    // Créer une notification dans la base de données
    await supabaseAdmin.from("deposit_notifications").insert({
      request_id: requestId,
      recipient_id: party.user_id,
      notification_type: "party_invitation",
      title: "Nouvelle demande de dépôt légal",
      message: `Vous avez été invité en tant que ${roleLabels[party.party_role]} pour la demande de dépôt légal "${party.request.title}" (${party.request.request_number}).`,
    });

    // Mettre à jour la date de notification
    await supabaseAdmin
      .from("legal_deposit_parties")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", partyId);

    console.log(`Notification sent to ${userEmail} for party ${partyId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-deposit-party:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});