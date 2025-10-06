import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { registrationId } = await req.json();

    // Récupérer les détails de l'inscription
    const { data: registration, error: regError } = await supabaseClient
      .from("service_registrations")
      .select(`
        *,
        bnrm_services (
          nom_service,
          description
        ),
        bnrm_tarifs (
          montant,
          devise,
          periode_validite
        ),
        service_subscriptions (
          subscription_type,
          start_date,
          end_date,
          amount
        )
      `)
      .eq("id", registrationId)
      .single();

    if (regError) throw regError;

    // Récupérer les informations de l'utilisateur
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(
      registration.user_id
    );

    if (userError) throw userError;

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", registration.user_id)
      .single();

    if (profileError) throw profileError;

    // Construction du message email
    const serviceName = registration.bnrm_services?.nom_service || "Service BNRM";
    const userFullName = `${profile.first_name} ${profile.last_name}`;
    const registrationData = registration.registration_data;

    let emailBody = `
      <h2>Confirmation d'inscription - ${serviceName}</h2>
      <p>Cher(e) ${userFullName},</p>
      <p>Votre inscription au service <strong>${serviceName}</strong> a été enregistrée avec succès.</p>
      
      <h3>Détails de votre inscription :</h3>
      <ul>
        <li><strong>Service :</strong> ${serviceName}</li>
        ${registration.bnrm_services?.description ? `<li><strong>Description :</strong> ${registration.bnrm_services.description}</li>` : ''}
        ${registrationData.phone ? `<li><strong>Téléphone :</strong> ${registrationData.phone}</li>` : ''}
        ${registrationData.institution ? `<li><strong>Institution :</strong> ${registrationData.institution}</li>` : ''}
        ${registrationData.address ? `<li><strong>Adresse :</strong> ${registrationData.address}</li>` : ''}
        <li><strong>Date d'inscription :</strong> ${new Date(registration.created_at).toLocaleDateString('fr-FR')}</li>
      </ul>
    `;

    if (registration.service_subscriptions) {
      const sub = registration.service_subscriptions;
      emailBody += `
        <h3>Détails de votre abonnement :</h3>
        <ul>
          <li><strong>Type :</strong> ${sub.subscription_type === 'monthly' ? 'Mensuel' : 'Annuel'}</li>
          <li><strong>Montant :</strong> ${sub.amount} MAD</li>
          <li><strong>Date de début :</strong> ${new Date(sub.start_date).toLocaleDateString('fr-FR')}</li>
          <li><strong>Date de fin :</strong> ${new Date(sub.end_date).toLocaleDateString('fr-FR')}</li>
        </ul>
        
        <p><strong>Note importante :</strong> Veuillez procéder au paiement de votre abonnement dans les meilleurs délais. Vous recevrez des notifications de rappel.</p>
      `;
    } else {
      emailBody += `
        <p>Ce service est <strong>gratuit</strong> et vous pouvez commencer à l'utiliser immédiatement.</p>
      `;
    }

    emailBody += `
      <hr>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      <p>Cordialement,<br>
      L'équipe de la Bibliothèque Nationale du Royaume du Maroc</p>
    `;

    console.log(`Email de confirmation préparé pour ${user.email}`);
    console.log(`Service: ${serviceName}, Utilisateur: ${userFullName}`);
    
    // Note: L'envoi réel de l'email nécessiterait l'intégration avec un service comme Resend
    // Pour l'instant, nous retournons simplement les détails qui seraient envoyés
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de confirmation préparé",
        emailDetails: {
          to: user.email,
          subject: `Confirmation d'inscription - ${serviceName}`,
          body: emailBody
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
