import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowRequest {
  action: 'get_workflow' | 'update_step' | 'create_workflow' | 'get_status';
  request_id?: string;
  step_number?: number;
  status?: string;
  comments?: string;
  workflow_type?: 'legal_deposit' | 'reproduction' | 'manuscript_review';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { action, request_id, step_number, status, comments, workflow_type }: WorkflowRequest = await req.json();

    console.log(`[WORKFLOW-SERVICE] Action: ${action}`);

    switch (action) {
      case 'get_workflow': {
        // Récupère le workflow d'une demande
        const { data, error } = await supabaseClient
          .from('deposit_workflow_steps')
          .select('*')
          .eq('request_id', request_id)
          .order('step_number', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify({ steps: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'update_step': {
        // Met à jour une étape du workflow
        const { data, error } = await supabaseClient
          .from('deposit_workflow_steps')
          .update({
            status,
            comments,
            gestionnaire_id: user.id,
            processed_at: status === 'termine' ? new Date().toISOString() : null,
          })
          .eq('request_id', request_id)
          .eq('step_number', step_number)
          .select()
          .single();

        if (error) throw error;

        // Log l'activité
        await supabaseClient
          .from('deposit_activity_log')
          .insert({
            request_id,
            user_id: user.id,
            action_type: 'workflow_step_updated',
            details: { step_number, status, comments },
          });

        return new Response(JSON.stringify({ success: true, step: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'create_workflow': {
        // Crée un workflow complet pour une nouvelle demande
        const workflowSteps = getWorkflowSteps(workflow_type || 'legal_deposit');

        const { data, error } = await supabaseClient
          .from('deposit_workflow_steps')
          .insert(
            workflowSteps.map((step, index) => ({
              request_id,
              step_number: index + 1,
              step_name: step,
              status: 'en_attente',
            }))
          )
          .select();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, steps: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_status': {
        // Récupère le statut global d'un workflow
        const { data, error } = await supabaseClient
          .from('deposit_workflow_steps')
          .select('*')
          .eq('request_id', request_id);

        if (error) throw error;

        const totalSteps = data.length;
        const completedSteps = data.filter(s => s.status === 'termine').length;
        const currentStep = data.find(s => s.status === 'en_cours') || data.find(s => s.status === 'en_attente');

        return new Response(JSON.stringify({
          total_steps: totalSteps,
          completed_steps: completedSteps,
          progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
          current_step: currentStep,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    console.error('[WORKFLOW-SERVICE] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getWorkflowSteps(type: string): string[] {
  switch (type) {
    case 'legal_deposit':
      return [
        'Réception de la demande',
        'Vérification des documents',
        'Attribution du numéro',
        'Validation',
        'Archivage',
      ];
    case 'reproduction':
      return [
        'Réception de la demande',
        'Vérification des droits',
        'Production',
        'Contrôle qualité',
        'Livraison',
      ];
    case 'manuscript_review':
      return [
        'Soumission',
        'Analyse initiale',
        'Validation scientifique',
        'Catalogage',
        'Publication',
      ];
    default:
      return ['Étape 1', 'Étape 2', 'Étape 3'];
  }
}
