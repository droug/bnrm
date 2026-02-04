import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { sessionId, transactionId } = await req.json();

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Récupérer la session de paiement
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session non trouvée");
    }

    console.log(`Verifying payment for session ${sessionId}, status: ${session.payment_status}`);

    // Mettre à jour la transaction
    const updateData: any = {
      stripe_payment_intent_id: session.payment_intent as string,
      payment_status: session.payment_status === 'paid' ? 'completed' : 'failed',
      is_3d_secure: true, // Stripe Checkout utilise toujours 3D Secure
    };

    if (session.payment_status === 'paid') {
      updateData.completed_at = new Date().toISOString();
      updateData.processed_at = new Date().toISOString();
    } else {
      updateData.error_message = `Payment status: ${session.payment_status}`;
    }

    const { data: transaction, error: updateError } = await supabaseClient
      .from('payment_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Si paiement réussi, mettre à jour le statut de la demande de reproduction
    if (session.payment_status === 'paid') {
      const requestId = session.metadata?.request_id;
      
      if (requestId) {
        console.log(`Updating reproduction request ${requestId} to paiement_recu`);
        
        const { error: reproductionError } = await supabaseClient
          .from('reproduction_requests')
          .update({
            status: 'paiement_recu',
            paid_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (reproductionError) {
          console.error('Error updating reproduction request status:', reproductionError);
        } else {
          console.log(`Reproduction request ${requestId} updated to paiement_recu`);
          
          // Envoyer notification de confirmation de paiement
          try {
            const { data: requestDetails } = await supabaseClient
              .from('reproduction_requests')
              .select('request_number, user_id, metadata')
              .eq('id', requestId)
              .single();

            if (requestDetails) {
              await supabaseClient.functions.invoke('send-reproduction-notification', {
                body: {
                  requestId: requestId,
                  recipientId: requestDetails.user_id,
                  notificationType: 'payment_received',
                  requestNumber: requestDetails.request_number,
                  documentTitle: (requestDetails.metadata as any)?.documentTitle || 'Document demandé',
                },
              });
            }
          } catch (notifError) {
            console.error('Error sending payment confirmation:', notifError);
          }
        }
      }
    }

    // Si c'est une recharge de wallet, créditer le wallet
    if (transaction.transaction_type === 'recharge_wallet' && session.payment_status === 'paid') {
      // Récupérer ou créer le wallet
      let { data: wallet, error: walletError } = await supabaseClient
        .from('bnrm_wallets')
        .select('*')
        .eq('user_id', transaction.user_id)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Créer le wallet s'il n'existe pas
        const { data: newWallet, error: createError } = await supabaseClient
          .from('bnrm_wallets')
          .insert({
            user_id: transaction.user_id,
            balance: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        wallet = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      // Mettre à jour le solde
      const { error: balanceError } = await supabaseClient
        .rpc('update_wallet_balance', {
          p_wallet_id: wallet!.id,
          p_amount: transaction.amount,
          p_transaction_type: 'recharge',
          p_reference_id: transaction.id,
          p_description: `Recharge via ${transaction.transaction_number}`,
        });

      if (balanceError) throw balanceError;

      // Enregistrer la recharge
      await supabaseClient
        .from('wallet_recharges')
        .insert({
          wallet_id: wallet!.id,
          transaction_id: transaction.id,
          amount: transaction.amount,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
    }

    console.log(`Payment verified successfully for transaction ${transaction.transaction_number}`);

    return new Response(
      JSON.stringify({
        success: session.payment_status === 'paid',
        status: session.payment_status,
        transaction: transaction,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in verify-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
