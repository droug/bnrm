import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  adhesionId: string;
  table: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { adhesionId, table, type }: NotificationRequest = await req.json();

    // Récupérer les détails de l'adhésion
    const { data: adhesion, error: adhesionError } = await supabase
      .from(table)
      .select("*")
      .eq("id", adhesionId)
      .single();

    if (adhesionError) throw adhesionError;

    // Récupérer les membres du comité de pilotage CBM
    const { data: committeeMembers, error: membersError } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        profiles!inner(email, full_name)
      `)
      .eq("role", "cbm_steering_committee")
      .eq("is_active", true);

    if (membersError) throw membersError;

    console.log(`Found ${committeeMembers?.length || 0} committee members`);

    // Créer des notifications pour chaque membre du comité
    if (committeeMembers && committeeMembers.length > 0) {
      const notifications = committeeMembers.map((member: any) => ({
        user_id: member.user_id,
        type: "adhesion_validation",
        title: `Nouvelle demande d'adhésion à valider`,
        message: `Une demande d'adhésion ${type === "catalogue" ? "au Catalogue Collectif" : "au Réseau des Bibliothèques"} de "${adhesion.nom_bibliotheque}" attend votre validation.`,
        link: `/cbm/admin/adhesions`,
        data: {
          adhesionId,
          table,
          type,
          bibliotheque: adhesion.nom_bibliotheque
        }
      }));

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error creating notifications:", notifError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifiedCount: committeeMembers?.length || 0 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-steering-committee function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
