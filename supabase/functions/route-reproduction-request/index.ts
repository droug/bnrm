import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReproductionRequest {
  manuscript_id: string;
  user_id: string;
  request_type: string;
  format: string;
  pages?: string;
  quantity?: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: ReproductionRequest = await req.json();
    
    console.log('📝 Nouvelle demande de reproduction:', requestData);

    // Récupérer les informations du manuscrit
    const { data: manuscript, error: manuscriptError } = await supabaseClient
      .from('manuscripts')
      .select('id, title, institution, catalog_metadata(*)')
      .eq('id', requestData.manuscript_id)
      .single();

    if (manuscriptError || !manuscript) {
      console.error('❌ Manuscrit non trouvé:', manuscriptError);
      throw new Error('Manuscrit non trouvé');
    }

    console.log('📚 Manuscrit trouvé:', manuscript.title, '- Institution:', manuscript.institution);

    let targetService = '';
    let redirectUrl = '';
    let requestCreated = false;

    // Déterminer la destination selon l'institution
    if (manuscript.institution === 'BNRM' || !manuscript.institution) {
      // Cas BNRM : rediriger vers le service de reproduction de la bibliothèque numérique
      targetService = 'BNRM - Service de Reproduction';
      redirectUrl = '/bibliotheque-numerique/reproduction';
      
      // Créer la demande dans le système BNRM
      const { data: reproRequest, error: reproError } = await supabaseClient
        .from('reproduction_requests')
        .insert({
          user_id: requestData.user_id,
          request_type: requestData.request_type,
          status: 'pending',
          priority: 'normal',
          notes: `Demande de reproduction pour le manuscrit: ${manuscript.title}\n${requestData.notes || ''}`,
        })
        .select()
        .single();

      if (reproError) {
        console.error('❌ Erreur création demande BNRM:', reproError);
        throw reproError;
      }

      // Ajouter les items de reproduction
      const { error: itemError } = await supabaseClient
        .from('reproduction_items')
        .insert({
          request_id: reproRequest.id,
          content_title: manuscript.title,
          format: requestData.format,
          pages: requestData.pages,
          quantity: requestData.quantity || 1,
          unit_price: 0, // À calculer selon les tarifs
          total_price: 0,
        });

      if (itemError) {
        console.error('❌ Erreur création item:', itemError);
        throw itemError;
      }

      requestCreated = true;
      console.log('✅ Demande créée dans le système BNRM:', reproRequest.request_number);

    } else {
      // Cas institution partenaire : rediriger vers leur système
      targetService = manuscript.institution;
      
      // Créer une notification pour l'institution partenaire
      const { error: notifError } = await supabaseClient
        .from('deposit_notifications')
        .insert({
          notification_type: 'reproduction_request',
          title: `Nouvelle demande de reproduction`,
          message: `Demande de reproduction pour le manuscrit "${manuscript.title}" de ${manuscript.institution}`,
          recipient_id: requestData.user_id,
        });

      if (notifError) {
        console.error('⚠️ Erreur création notification:', notifError);
      }

      // URL de redirection vers l'institution partenaire (à configurer)
      const partnerUrls: Record<string, string> = {
        'Archives du Maroc': 'https://archives.ma/reproduction',
        'Bibliothèque Hassania': 'https://bibliothequehassania.ma/services/reproduction',
        // Ajouter d'autres institutions partenaires
      };

      redirectUrl = partnerUrls[manuscript.institution] || '/contact';
      console.log('↗️ Redirection vers institution partenaire:', targetService);
    }

    // Log de l'activité
    await supabaseClient.from('activity_logs').insert({
      user_id: requestData.user_id,
      action: 'reproduction_request_routed',
      resource_type: 'manuscripts',
      resource_id: manuscript.id,
      details: {
        target_service: targetService,
        request_type: requestData.request_type,
        format: requestData.format,
        redirected: !requestCreated,
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        target_service: targetService,
        redirect_url: redirectUrl,
        request_created: requestCreated,
        message: requestCreated 
          ? `Votre demande a été créée et sera traitée par ${targetService}`
          : `Votre demande sera traitée par ${targetService}. Vous allez être redirigé...`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur routage demande de reproduction:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});