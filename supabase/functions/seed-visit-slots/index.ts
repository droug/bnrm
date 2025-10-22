import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting to seed visit slots...");

    // Supprimer les anciens créneaux de test
    const { error: deleteError } = await supabase
      .from("visits_slots")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Error deleting old slots:", deleteError);
    }

    // Créer des créneaux pour les 30 prochains jours
    const slots = [];
    const today = new Date();
    const langues = ["arabe", "français", "anglais", "amazigh"];
    const heures = ["10:00:00", "14:00:00", "16:00:00"];

    for (let day = 1; day <= 30; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      // Ignorer les weekends (samedi et dimanche)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      const dateStr = date.toISOString().split("T")[0];

      for (const heure of heures) {
        // Créer un créneau pour chaque langue
        for (const langue of langues) {
          // Varier la capacité
          const capacite = Math.random() > 0.3 ? 30 : 20;
          
          // Simuler quelques créneaux déjà réservés
          const reservations = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0;

          slots.push({
            date: dateStr,
            heure: heure,
            langue: langue,
            capacite_max: capacite,
            reservations_actuelles: reservations,
            statut: reservations >= capacite ? "complet" : "disponible",
          });
        }
      }
    }

    console.log(`Creating ${slots.length} visit slots...`);

    // Insérer les créneaux par lots de 100
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < slots.length; i += batchSize) {
      const batch = slots.slice(i, i + batchSize);
      
      const { error: insertError, data } = await supabase
        .from("visits_slots")
        .insert(batch)
        .select();

      if (insertError) {
        console.error("Error inserting batch:", insertError);
        throw insertError;
      }

      inserted += data?.length || 0;
      console.log(`Inserted ${inserted}/${slots.length} slots`);
    }

    console.log(`Successfully created ${inserted} visit slots`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${inserted} créneaux de visites guidées ont été créés avec succès`,
        stats: {
          total_slots: inserted,
          dates_count: Math.floor(inserted / (heures.length * langues.length)),
          languages: langues,
          time_slots: heures,
        },
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
    console.error("Error in seed-visit-slots function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
